-- BookStack: books table (Supabase / PostgreSQL)
-- Run in Supabase SQL Editor. Safe to re-run migration block if table already exists.

CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Vill läsa',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id UUID,
  cover_image_url TEXT
);

-- Migration for existing tables
ALTER TABLE books ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Optional: link to Supabase Auth when real auth is enabled
-- ALTER TABLE books ADD CONSTRAINT books_user_id_fkey
--   FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE SET NULL;

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow all" ON books
  FOR ALL
  USING (true);
