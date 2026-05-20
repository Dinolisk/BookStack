import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getDemoUser, signToken } from "../utils/token.js";

const router = express.Router();

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
