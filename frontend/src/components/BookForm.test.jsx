import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BookForm from "./BookForm";
import { createBook } from "../services/api";

vi.mock("../services/api", () => ({
  createBook: vi.fn(),
}));

vi.mock("./BookSearch", () => ({
  default: ({ onSelect }) => (
    <button
      type="button"
      onClick={() =>
        onSelect({
          id: "test-id",
          title: "Harry Potter",
          author: "J.K. Rowling",
          coverImageUrl: "https://example.com/cover.jpg",
        })
      }
    >
      Välj testbok
    </button>
  ),
}));

function renderBookForm() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BookForm />
    </QueryClientProvider>
  );
}

describe("BookForm", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows validation error in manual mode when title is empty", async () => {
    const user = userEvent.setup();
    renderBookForm();

    await user.click(
      screen.getByRole("button", { name: /hittar du inte boken/i })
    );
    await user.type(screen.getByRole("textbox", { name: /författare/i }), "Astrid Lindgren");
    await user.click(screen.getByRole("button", { name: /lägg till bok/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Titel och författare krävs."
    );
    expect(createBook).not.toHaveBeenCalled();
  });

  it("submits selected book with cover image", async () => {
    const user = userEvent.setup();
    createBook.mockResolvedValueOnce({ id: 1 });

    renderBookForm();

    await user.click(screen.getByRole("button", { name: /välj testbok/i }));
    await user.click(screen.getByRole("button", { name: /lägg till bok/i }));

    expect(createBook).toHaveBeenCalledOnce();
    expect(createBook.mock.calls[0][0]).toEqual({
      title: "Harry Potter",
      author: "J.K. Rowling",
      status: "Vill läsa",
      cover_image_url: "https://example.com/cover.jpg",
    });
  });

  it("shows loading label and disables submit while pending", async () => {
    const user = userEvent.setup();
    createBook.mockImplementation(
      () =>
        new Promise(() => {
          // Keeps mutation pending
        })
    );

    renderBookForm();

    await user.click(screen.getByRole("button", { name: /välj testbok/i }));
    await user.click(screen.getByRole("button", { name: /lägg till bok/i }));

    expect(screen.getByRole("button", { name: /sparar/i })).toBeDisabled();
  });
});
