-- Optional demo books for the demo login showcase.
-- Replace :demo_user_id with your DEMO_USER_ID from .env

INSERT INTO books (title, author, status, user_id)
VALUES
  ('Broderna Lejonhjarta', 'Astrid Lindgren', 'Har läst klart', :demo_user_id),
  ('Harry Potter och De Vises Sten', 'J.K. Rowling', 'Läser', :demo_user_id),
  ('Dune', 'Frank Herbert', 'Vill läsa', :demo_user_id)
ON CONFLICT DO NOTHING;
