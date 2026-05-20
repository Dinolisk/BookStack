import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgresql://test:test@localhost:5432/test",
      JWT_SECRET: "test-jwt-secret",
      DEMO_USER_ID: "11111111-1111-1111-1111-111111111111",
      DEMO_USER_EMAIL: "demo@bookstack.com",
    },
  },
});
