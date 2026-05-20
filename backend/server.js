import "dotenv/config";
import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "BookStack API is running",
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// Exportera appen för användning i Supertest
export default app;

// Starta servern endast om filen körs direkt (inte via vitest)
if (process.env.NODE_ENV !== "test") {
  const server = app.listen(PORT, () => {
    console.log(`BookStack API listening on port ${PORT}`);
    console.log(
      `Google Books API key: ${process.env.GOOGLE_BOOKS_API_KEY ? "loaded" : "missing"}`
    );
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use.`);
    } else {
      console.error("Server failed to start:", error.message);
    }
    process.exit(1);
  });
}