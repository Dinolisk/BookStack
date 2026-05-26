import bcrypt from "bcryptjs";
import express from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { getDemoUser, signToken } from "../utils/token.js";

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Ange en giltig e-postadress." });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: "Lösenordet måste vara minst 8 tecken." });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "E-postadressen är redan registrerad." });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, password_hash]
    );

    const user = result.rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ error: "E-post och lösenord krävs." });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];
    const valid = user && await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "Fel e-post eller lösenord." });
    }

    const token = signToken(user);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/demo", (_req, res) => {
  try {
    const user = getDemoUser();
    const token = signToken(user);

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
