-- Rating (1–5 stars) and optional review text
ALTER TABLE books ADD COLUMN IF NOT EXISTS rating SMALLINT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS review TEXT;

ALTER TABLE books DROP CONSTRAINT IF EXISTS books_rating_check;
ALTER TABLE books ADD CONSTRAINT books_rating_check
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));
