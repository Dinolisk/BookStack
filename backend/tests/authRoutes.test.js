import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const { mockQuery } = vi.hoisted(() => ({ mockQuery: vi.fn() }));

vi.mock("../db.js", () => ({ default: { query: mockQuery } }));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2b$12$hashedpassword"),
    compare: vi.fn(),
  },
}));

import app from "../server.js";
import bcrypt from "bcryptjs";

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    mockQuery.mockReset();
    vi.mocked(bcrypt.hash).mockResolvedValue("$2b$12$hashedpassword");
    vi.mocked(bcrypt.compare).mockReset();
  });

  it("returns 201 with token and user on success", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 99, email: "new@example.com" }] });

    const res = await request(app).post("/api/auth/register").send({
      email: "new@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf("string");
    expect(res.body.user.email).toBe("new@example.com");
  });

  it("returns 409 when email is already registered", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const res = await request(app).post("/api/auth/register").send({
      email: "taken@example.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("E-postadressen är redan registrerad.");
  });

  it("returns 400 for invalid email format", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "not-an-email",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Ange en giltig e-postadress.");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 400 when password is shorter than 8 characters", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "user@example.com",
      password: "short",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Lösenordet måste vara minst 8 tecken.");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 400 when email is missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    mockQuery.mockReset();
    vi.mocked(bcrypt.compare).mockReset();
  });

  it("returns 200 with token and user on success", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 1, email: "user@example.com", password_hash: "hashed" }],
    });
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(true);

    const res = await request(app).post("/api/auth/login").send({
      email: "user@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf("string");
    expect(res.body.user.email).toBe("user@example.com");
  });

  it("returns 401 for wrong password", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 1, email: "user@example.com", password_hash: "hashed" }],
    });
    vi.mocked(bcrypt.compare).mockResolvedValueOnce(false);

    const res = await request(app).post("/api/auth/login").send({
      email: "user@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Fel e-post eller lösenord.");
  });

  it("returns 401 when user does not exist", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Fel e-post eller lösenord.");
  });

  it("returns 400 when password is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "user@example.com",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("E-post och lösenord krävs.");
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
