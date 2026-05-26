import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BookCard from "./BookCard";
import { deleteBook, updateBook } from "../services/api";

vi.mock("../services/api", () => ({
  updateBook: vi.fn(),
  deleteBook: vi.fn(),
}));

const sampleBook = {
  id: 1,
  title: "Harry Potter",
  author: "J.K. Rowling",
  status: "Vill läsa",
  created_at: "2026-05-20T12:00:00.000Z",
};

function renderBookCard(book = sampleBook) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ul>
        <BookCard book={book} />
      </ul>
    </QueryClientProvider>
  );
}

describe("BookCard", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens edit mode and validates empty title", async () => {
    const user = userEvent.setup();
    renderBookCard();

    await user.click(screen.getByRole("button", { name: /redigera/i }));

    const titleInput = screen.getByDisplayValue("Harry Potter");
    await user.clear(titleInput);
    await user.click(screen.getByRole("button", { name: /^spara$/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Titel och författare krävs."
    );
    expect(updateBook).not.toHaveBeenCalled();
  });

  it("calls updateBook when edit is saved", async () => {
    const user = userEvent.setup();
    updateBook.mockResolvedValueOnce({
      ...sampleBook,
      status: "Läser",
    });

    renderBookCard();

    await user.click(screen.getByRole("button", { name: /redigera/i }));
    await user.selectOptions(screen.getByRole("combobox"), "Läser");
    await user.click(screen.getByRole("button", { name: /^spara$/i }));

    expect(updateBook).toHaveBeenCalledWith(1, {
      title: "Harry Potter",
      author: "J.K. Rowling",
      status: "Läser",
      rating: null,
      review: null,
    });
  });

  it("saves rating and review when editing", async () => {
    const user = userEvent.setup();
    updateBook.mockResolvedValueOnce({
      ...sampleBook,
      status: "Har läst klart",
      rating: 4,
      review: "Magisk!",
    });

    renderBookCard();

    await user.click(screen.getByRole("button", { name: /redigera/i }));
    await user.selectOptions(screen.getByRole("combobox"), "Har läst klart");
    await user.click(screen.getByRole("button", { name: /4 stjärnor/i }));
    await user.type(
      screen.getByPlaceholderText(/skriv ett kort omdöme/i),
      "Magisk!"
    );
    await user.click(screen.getByRole("button", { name: /^spara$/i }));

    expect(updateBook).toHaveBeenCalledWith(1, {
      title: "Harry Potter",
      author: "J.K. Rowling",
      status: "Har läst klart",
      rating: 4,
      review: "Magisk!",
    });
  });

  it("displays rating on the card", () => {
    renderBookCard({
      ...sampleBook,
      status: "Har läst klart",
      rating: 5,
      review: "Bästa boken någonsin",
    });

    expect(screen.getByLabelText(/5 av 5 stjärnor/i)).toBeInTheDocument();
  });

  it("opens modal when Detaljer is clicked", async () => {
    const user = userEvent.setup();
    renderBookCard({
      ...sampleBook,
      status: "Har läst klart",
      rating: 5,
      review: "Bästa boken någonsin",
    });

    await user.click(screen.getByRole("button", { name: /^detaljer$/i }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Bästa boken någonsin")).toBeInTheDocument();
  });

  it("closes modal when Stäng is clicked", async () => {
    const user = userEvent.setup();
    renderBookCard({
      ...sampleBook,
      review: "En fin bok",
    });

    await user.click(screen.getByRole("button", { name: /^detaljer$/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const closeButtons = within(screen.getByRole("dialog")).getAllByRole(
      "button",
      { name: /stäng/i }
    );
    await user.click(closeButtons[0]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("requires confirmation before delete", async () => {
    const user = userEvent.setup();
    renderBookCard();

    await user.click(screen.getByRole("button", { name: /^ta bort$/i }));
    expect(screen.getByText(/ta bort den här boken permanent/i)).toBeInTheDocument();
    expect(deleteBook).not.toHaveBeenCalled();
  });

  it("hides rating and review fields when status is not Har läst klart", async () => {
    const user = userEvent.setup();
    renderBookCard();

    await user.click(screen.getByRole("button", { name: /redigera/i }));

    expect(screen.queryByPlaceholderText(/skriv ett kort omdöme/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/stjärn/i)).not.toBeInTheDocument();
  });

  it("shows rating and review fields when status is Har läst klart", async () => {
    const user = userEvent.setup();
    renderBookCard({ ...sampleBook, status: "Har läst klart" });

    await user.click(screen.getByRole("button", { name: /redigera/i }));

    expect(screen.getByPlaceholderText(/skriv ett kort omdöme/i)).toBeInTheDocument();
  });

  it("hides rating and review fields when status is changed away from Har läst klart", async () => {
    const user = userEvent.setup();
    renderBookCard({ ...sampleBook, status: "Har läst klart" });

    await user.click(screen.getByRole("button", { name: /redigera/i }));
    expect(screen.getByPlaceholderText(/skriv ett kort omdöme/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox"), "Läser");
    expect(screen.queryByPlaceholderText(/skriv ett kort omdöme/i)).not.toBeInTheDocument();
  });

  it("sends null rating and review when status changes away from Har läst klart", async () => {
    const user = userEvent.setup();
    updateBook.mockResolvedValueOnce({ ...sampleBook, status: "Läser", rating: null, review: null });

    renderBookCard({ ...sampleBook, status: "Har läst klart", rating: 4, review: "Bra bok" });

    await user.click(screen.getByRole("button", { name: /redigera/i }));
    await user.selectOptions(screen.getByRole("combobox"), "Läser");
    await user.click(screen.getByRole("button", { name: /^spara$/i }));

    expect(updateBook).toHaveBeenCalledWith(1, expect.objectContaining({
      status: "Läser",
      rating: null,
      review: null,
    }));
  });

  it("calls deleteBook after confirmation", async () => {
    const user = userEvent.setup();
    deleteBook.mockResolvedValueOnce(null);
    renderBookCard();

    await user.click(screen.getByRole("button", { name: /^ta bort$/i }));
    await user.click(screen.getByRole("button", { name: /ja, ta bort/i }));

    expect(deleteBook).toHaveBeenCalledWith(1);
  });
});
