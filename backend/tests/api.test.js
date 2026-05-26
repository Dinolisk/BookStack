import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import {
  TEST_USER_ID,
  createAuthHeader,
} from "./helpers/auth.js";

const { mockQuery } = vi.hoisted(() => ({
  mockQuery: vi.fn(),
}));

vi.mock("../db.js", () => ({
  default: {
    query: mockQuery,
  },
}));

import app from "../server.js";

const sampleBook = {
  id: 1,
  title: "Harry Potter",
  author: "J.K. Rowling",
  status: "Vill läsa",
  user_id: TEST_USER_ID,
  created_at: "2026-05-20T12:00:00.000Z",
};

describe("BookStack API", () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  describe("GET /", () => {
    it("returns health check", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "ok",
        message: "BookStack API is running",
      });
    });
  });

  describe("GET /api/books", () => {
    it("returns 401 without a token", async () => {
      const response = await request(app).get("/api/books");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Inloggning krävs.");
    });

    it("returns 200 with an empty list", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get("/api/books")
        .set(createAuthHeader());

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM books WHERE user_id = $1 ORDER BY created_at DESC",
        [TEST_USER_ID]
      );
    });

    it("returns 200 with books", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [sampleBook] });

      const response = await request(app)
        .get("/api/books")
        .set(createAuthHeader());

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it("returns 500 when the database fails", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Database connection lost"));

      const response = await request(app)
        .get("/api/books")
        .set(createAuthHeader());

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database connection lost");
    });
  });

  describe("POST /api/books", () => {
    it("returns 401 without a token", async () => {
      const response = await request(app).post("/api/books").send({
        title: "Harry Potter",
        author: "J.K. Rowling",
      });

      expect(response.status).toBe(401);
    });

    it("returns 201 when data is valid", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [sampleBook] });

      const response = await request(app)
        .post("/api/books")
        .set(createAuthHeader())
        .send({
          title: "Harry Potter",
          author: "J.K. Rowling",
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(sampleBook);
    });

    it("returns 201 with custom status", async () => {
      const book = { ...sampleBook, status: "Läser" };
      mockQuery.mockResolvedValueOnce({ rows: [book] });

      const response = await request(app)
        .post("/api/books")
        .set(createAuthHeader())
        .send({
          title: "Harry Potter",
          author: "J.K. Rowling",
          status: "Läser",
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("Läser");
    });

    it("returns 400 when title and author are missing", async () => {
      const response = await request(app)
        .post("/api/books")
        .set(createAuthHeader())
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Titel och författare krävs.");
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("returns 400 when title is whitespace only", async () => {
      const response = await request(app)
        .post("/api/books")
        .set(createAuthHeader())
        .send({ title: "   ", author: "J.K. Rowling" });

      expect(response.status).toBe(400);
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("returns 500 when the database fails", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Insert failed"));

      const response = await request(app)
        .post("/api/books")
        .set(createAuthHeader())
        .send({
          title: "Harry Potter",
          author: "J.K. Rowling",
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Insert failed");
    });
  });

  describe("PUT /api/books/:id", () => {
    it("returns 200 when updating status", async () => {
      const updated = { ...sampleBook, status: "Läser" };
      mockQuery.mockResolvedValueOnce({ rows: [updated] });

      const response = await request(app)
        .put("/api/books/1")
        .set(createAuthHeader())
        .send({ status: "Läser" });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("Läser");
    });

    it("returns 400 for invalid id", async () => {
      const response = await request(app)
        .put("/api/books/abc")
        .set(createAuthHeader())
        .send({ status: "Läser" });

      expect(response.status).toBe(400);
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("returns 404 when book is not found", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .put("/api/books/999")
        .set(createAuthHeader())
        .send({ status: "Läser" });

      expect(response.status).toBe(404);
    });

    it("returns 200 when updating rating and review", async () => {
      const updated = {
        ...sampleBook,
        status: "Har läst klart",
        rating: 5,
        review: "En favorit!",
      };
      mockQuery.mockResolvedValueOnce({ rows: [updated] });

      const response = await request(app)
        .put("/api/books/1")
        .set(createAuthHeader())
        .send({
          rating: 5,
          review: "En favorit!",
        });

      expect(response.status).toBe(200);
      expect(response.body.rating).toBe(5);
      expect(response.body.review).toBe("En favorit!");
    });

    it("returns 400 for invalid rating", async () => {
      const response = await request(app)
        .put("/api/books/1")
        .set(createAuthHeader())
        .send({ rating: 6 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        "Betyg måste vara ett heltal mellan 1 och 5."
      );
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("clears rating and review in the database when status changes to non-read", async () => {
      const updated = { ...sampleBook, status: "Läser", rating: null, review: null };
      mockQuery.mockResolvedValueOnce({ rows: [updated] });

      await request(app)
        .put("/api/books/1")
        .set(createAuthHeader())
        .send({ status: "Läser", rating: 4, review: "Ska rensas" });

      const [sql, values] = mockQuery.mock.calls[0];
      expect(sql).toContain("rating = $");
      expect(sql).toContain("review = $");
      const nullCount = values.filter((v) => v === null).length;
      expect(nullCount).toBe(2);
    });

    it("returns 200 when clearing rating", async () => {
      const updated = { ...sampleBook, rating: null, review: null };
      mockQuery.mockResolvedValueOnce({ rows: [updated] });

      const response = await request(app)
        .put("/api/books/1")
        .set(createAuthHeader())
        .send({ rating: null, review: null });

      expect(response.status).toBe(200);
      expect(response.body.rating).toBeNull();
    });
  });

  describe("DELETE /api/books/:id", () => {
    it("returns 204 when book is deleted", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [sampleBook] });

      const response = await request(app)
        .delete("/api/books/1")
        .set(createAuthHeader());

      expect(response.status).toBe(204);
    });

    it("returns 204 when demo account deletes a book", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [sampleBook] });

      const response = await request(app)
        .delete("/api/books/1")
        .set(createAuthHeader({ isDemo: true }));

      expect(response.status).toBe(204);
    });

    it("returns 404 when book is not found", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .delete("/api/books/999")
        .set(createAuthHeader());

      expect(response.status).toBe(404);
    });
  });

  describe("Unknown routes", () => {
    it("returns 404 for unknown paths", async () => {
      const response = await request(app).get("/api/unknown");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Route not found.");
    });
  });
});
