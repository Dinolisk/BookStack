import { describe, expect, it } from "vitest";
import {
  STATUS_OPTIONS,
  countBooksByStatus,
  filterBooksByStatus,
} from "./bookStatus";

const books = [
  { id: 1, title: "A", author: "X", status: "Vill läsa" },
  { id: 2, title: "B", author: "Y", status: "Läser" },
  { id: 3, title: "C", author: "Z", status: "Läser" },
  { id: 4, title: "D", author: "W", status: "Har läst klart" },
];

describe("bookStatus helpers", () => {
  it("counts books in each status tab", () => {
    expect(countBooksByStatus(books)).toEqual({
      all: 4,
      "Vill läsa": 1,
      Läser: 2,
      "Har läst klart": 1,
    });
  });

  it("returns all books for the Alla tab", () => {
    expect(filterBooksByStatus(books, "all")).toHaveLength(4);
  });

  it("filters books by active status tab", () => {
    expect(filterBooksByStatus(books, "Läser")).toEqual([
      books[1],
      books[2],
    ]);
  });

  it("returns an empty list when no books match the tab", () => {
    const onlyWantToRead = [{ id: 1, title: "A", author: "X", status: "Vill läsa" }];
    expect(filterBooksByStatus(onlyWantToRead, "Läser")).toEqual([]);
  });

  it("covers every configured status option", () => {
    for (const status of STATUS_OPTIONS) {
      expect(filterBooksByStatus(books, status).every((book) => book.status === status)).toBe(
        true
      );
    }
  });
});
