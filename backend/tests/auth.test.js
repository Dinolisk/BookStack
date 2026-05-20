import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../server.js";

describe("Auth routes", () => {
  it("POST /api/auth/demo returns a token and demo user", async () => {
    const response = await request(app).post("/api/auth/demo");

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTypeOf("string");
    expect(response.body.user).toEqual({
      id: process.env.DEMO_USER_ID,
      email: process.env.DEMO_USER_EMAIL,
      isDemo: true,
    });
  });

  it("GET /api/auth/me returns the authenticated user", async () => {
    const login = await request(app).post("/api/auth/demo");

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(process.env.DEMO_USER_EMAIL);
    expect(response.body.user.isDemo).toBe(true);
  });

  it("GET /api/auth/me returns 401 without a token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Inloggning krävs.");
  });
});
