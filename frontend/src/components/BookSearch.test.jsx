import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BookSearch from "./BookSearch";
import { searchBooks } from "../services/api";

vi.mock("../services/api", () => ({
  searchBooks: vi.fn(),
}));

function renderBookSearch(onSelect = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return {
    onSelect,
    ...render(
      <QueryClientProvider client={queryClient}>
        <BookSearch onSelect={onSelect} />
      </QueryClientProvider>
    ),
  };
}

describe("BookSearch", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows empty state when no books are found", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    searchBooks.mockResolvedValueOnce([]);

    renderBookSearch();

    await user.type(screen.getByRole("searchbox"), "xyzokänd");
    vi.advanceTimersByTime(500);

    expect(await screen.findByText(/Inga träffar/i)).toBeInTheDocument();
  });

  it("shows API error message when search fails", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    searchBooks.mockRejectedValueOnce(
      new Error(
        "Google Books kräver en API-nyckel. Lägg till GOOGLE_BOOKS_API_KEY i backend/.env."
      )
    );

    renderBookSearch();

    await user.type(screen.getByRole("searchbox"), "harry");
    vi.advanceTimersByTime(500);

    expect(await screen.findByRole("alert")).toHaveTextContent(/API-nyckel/i);
  });

  it("calls onSelect when a search result is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSelect = vi.fn();
    searchBooks.mockResolvedValueOnce([
      {
        id: "abc",
        title: "Harry Potter",
        author: "J.K. Rowling",
        coverImageUrl: "https://example.com/cover.jpg",
      },
    ]);

    renderBookSearch(onSelect);

    await user.type(screen.getByRole("searchbox"), "harry");
    vi.advanceTimersByTime(500);

    await user.click(await screen.findByRole("button", { name: /harry potter/i }));

    expect(onSelect).toHaveBeenCalledWith({
      id: "abc",
      title: "Harry Potter",
      author: "J.K. Rowling",
      coverImageUrl: "https://example.com/cover.jpg",
    });
  });
});
