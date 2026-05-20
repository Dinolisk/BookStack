import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createAuthHeader } from "./helpers/auth.js";

const { mockQuery } = vi.hoisted(() => ({
  mockQuery: vi.fn(),
}));

vi.mock("../db.js", () => ({
  default: {
    query: mockQuery,
  },
}));

vi.mock("../services/googleBooks.js", () => ({
  searchGoogleBooks: vi.fn(),
}));

import app from "../server.js";
import { searchGoogleBooks } from "../services/googleBooks.js";

describe("Book search routes", () => {
  beforeEach(() => {
    mockQuery.mockReset();
    vi.clearAllMocks();
  });

  it("returns 401 without a token", async () => {
    const response = await request(app).get("/api/books/search?q=harry");

    expect(response.status).toBe(401);
  });

  it("returns 400 when query is missing", async () => {
    const response = await request(app)
      .get("/api/books/search")
      .set(createAuthHeader());

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Sökterm krävs.");
  });

  it("returns search results from Google Books", async () => {
    searchGoogleBooks.mockResolvedValueOnce([
      {
        id: "abc123",
        title: "Harry Potter",
        author: "J.K. Rowling",
        coverImageUrl: "https://example.com/cover.jpg",
      },
    ]);

    const response = await request(app)
      .get("/api/books/search?q=harry%20potter")
      .set(createAuthHeader());

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(searchGoogleBooks).toHaveBeenCalledWith("harry potter");
  });

  it("returns an empty array when no books are found", async () => {
    searchGoogleBooks.mockResolvedValueOnce([]);

    const response = await request(app)
      .get("/api/books/search?q=ok%C3%A4ndligt")
      .set(createAuthHeader());

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns 503 when Google Books API fails", async () => {
    searchGoogleBooks.mockRejectedValueOnce(
      new Error("Google Books kräver en API-nyckel. Lägg till GOOGLE_BOOKS_API_KEY i backend/.env (gratis via Google Cloud Console).")
    );

    const response = await request(app)
      .get("/api/books/search?q=harry")
      .set(createAuthHeader());

    expect(response.status).toBe(503);
    expect(response.body.error).toContain("API-nyckel");
  });
});
