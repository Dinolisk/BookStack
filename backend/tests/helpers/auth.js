import jwt from "jsonwebtoken";

export const TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000";
export const DEMO_USER_ID = "11111111-1111-1111-1111-111111111111";

export function createAuthHeader(overrides = {}) {
  const token = jwt.sign(
    {
      sub: overrides.id ?? TEST_USER_ID,
      email: overrides.email ?? "test@example.com",
      isDemo: overrides.isDemo ?? false,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { Authorization: `Bearer ${token}` };
}
