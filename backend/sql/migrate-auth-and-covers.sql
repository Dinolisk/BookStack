-- Run this in Supabase → SQL Editor
-- Adds columns required for auth and Google Books covers

ALTER TABLE books ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
