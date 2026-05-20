import express from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { searchGoogleBooks } from "../services/googleBooks.js";

const router = express.Router();

router.use(requireAuth);

function parseBookId(rawId) {
  const id = Number.parseInt(rawId, 10);
  if (Number.isNaN(id) || id < 1) {
    return null;
  }
  return id;
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

router.get("/search", async (req, res) => {
  const query = req.query.q?.trim();

  if (!query) {
    return res.status(400).json({ error: "Sökterm krävs." });
  }

  try {
    const results = await searchGoogleBooks(query);
    res.json(results);
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM books WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  const title = req.body.title?.trim();
  const author = req.body.author?.trim();
  const status = req.body.status?.trim() || "Vill läsa";
  const coverImageUrl = req.body.cover_image_url?.trim() || null;

  if (!title || !author) {
    return res.status(400).json({ error: "Titel och författare krävs." });
  }

  if (coverImageUrl && !isValidUrl(coverImageUrl)) {
    return res.status(400).json({ error: "Ogiltig omslags-URL." });
  }

  try {
    const result = await pool.query(
      "INSERT INTO books (title, author, status, user_id, cover_image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, author, status, req.user.id, coverImageUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const id = parseBookId(req.params.id);

  if (id === null) {
    return res.status(400).json({ error: "Ogiltigt bok-ID." });
  }

  const updates = [];
  const values = [];

  if (req.body.title !== undefined) {
    const title = req.body.title?.trim();
    if (!title) {
      return res.status(400).json({ error: "Titel får inte vara tom." });
    }
    values.push(title);
    updates.push(`title = $${values.length}`);
  }

  if (req.body.author !== undefined) {
    const author = req.body.author?.trim();
    if (!author) {
      return res.status(400).json({ error: "Författare får inte vara tom." });
    }
    values.push(author);
    updates.push(`author = $${values.length}`);
  }

  if (req.body.status !== undefined) {
    const status = req.body.status?.trim();
    if (!status) {
      return res.status(400).json({ error: "Status får inte vara tom." });
    }
    values.push(status);
    updates.push(`status = $${values.length}`);
  }

  if (req.body.cover_image_url !== undefined) {
    const coverImageUrl = req.body.cover_image_url?.trim() || null;
    if (coverImageUrl && !isValidUrl(coverImageUrl)) {
      return res.status(400).json({ error: "Ogiltig omslags-URL." });
    }
    values.push(coverImageUrl);
    updates.push(`cover_image_url = $${values.length}`);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "Ingen data att uppdatera." });
  }

  values.push(id);
  values.push(req.user.id);

  try {
    const result = await pool.query(
      `UPDATE books SET ${updates.join(", ")} WHERE id = $${values.length - 1} AND user_id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Boken hittades inte." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const id = parseBookId(req.params.id);

  if (id === null) {
    return res.status(400).json({ error: "Ogiltigt bok-ID." });
  }

  try {
    const result = await pool.query(
      "DELETE FROM books WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Boken hittades inte." });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
