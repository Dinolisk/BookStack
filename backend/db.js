import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in environment variables.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("Connected to database.");
});

pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err.message);
});

export default pool;
