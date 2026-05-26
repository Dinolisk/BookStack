import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BookList from "./BookList";
import { getBooks } from "../services/api";

vi.mock("../services/api", () => ({
  getBooks: vi.fn(),
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { email: "test@example.com", isDemo: false },
  }),
}));

const books = [
  { id: 1, title: "Book A", author: "Author A", status: "Vill läsa" },
  { id: 2, title: "Book B", author: "Author B", status: "Läser" },
  { id: 3, title: "Book C", author: "Author C", status: "Har läst klart" },
];

function renderBookList() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BookList />
    </QueryClientProvider>
  );
}

describe("BookList status tabs", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    getBooks.mockResolvedValue(books);
  });

  it("shows all books on the Alla tab", async () => {
    renderBookList();

    // Use role-based query to target the heading, not the cover placeholder span
    expect(await screen.findByRole("heading", { name: "Book A" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Book B" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Book C" })).toBeInTheDocument();
  });

  it("filters books when a status tab is selected", async () => {
    const user = userEvent.setup();
    renderBookList();

    await screen.findByRole("heading", { name: "Book A" });
    await user.click(screen.getByRole("tab", { name: /läser/i }));

    expect(screen.getByRole("heading", { name: "Book B" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Book A" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Book C" })).not.toBeInTheDocument();
  });

  it("shows an empty-state message for tabs without books", async () => {
    getBooks.mockResolvedValueOnce([
      { id: 1, title: "Book A", author: "Author A", status: "Vill läsa" },
    ]);

    const user = userEvent.setup();
    renderBookList();

    await screen.findByRole("heading", { name: "Book A" });
    await user.click(screen.getByRole("tab", { name: /läser/i }));

    expect(
      screen.getByText('Inga böcker med status "Läser"')
    ).toBeInTheDocument();
  });
});
