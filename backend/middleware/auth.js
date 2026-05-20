import { verifyToken } from "../utils/token.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Inloggning krävs." });
  }

  try {
    const token = header.slice(7);
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Ogiltig eller utgången token." });
  }
}
