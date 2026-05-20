import jwt from "jsonwebtoken";

const TOKEN_EXPIRY = "7d";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not set in environment variables.");
  }

  return secret;
}

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      isDemo: Boolean(user.isDemo),
    },
    getJwtSecret(),
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyToken(token) {
  const payload = jwt.verify(token, getJwtSecret());

  return {
    id: payload.sub,
    email: payload.email,
    isDemo: Boolean(payload.isDemo),
  };
}

export function getDemoUser() {
  const id = process.env.DEMO_USER_ID;
  const email = process.env.DEMO_USER_EMAIL || "demo@bookstack.com";

  if (!id) {
    throw new Error("DEMO_USER_ID is not set in environment variables.");
  }

  return {
    id,
    email,
    isDemo: true,
  };
}
