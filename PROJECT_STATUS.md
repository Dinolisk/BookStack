# BookStack: Projektstatus (Source of Truth)

## Projektmål

Bygga en fullstack-applikation ("BookStack") för bokälskare.

- **Frontend:** React + Tailwind CSS
- **Backend:** Node.js + Express
- **Databas:** PostgreSQL (Supabase, Session Pooler)
- **Fokus:** Ren kod, bra testning (QA-fokus) och en smidig demo-upplevelse.

---

## ✅ Avklarat

### Sprint 1 – Fundament

- [x] Backend-setup (Express, CORS, Dotenv)
- [x] Databasanslutning (Supabase Session Pooler)
- [x] `.env` + `.gitignore` + GitHub-repo

### Sprint 2 – Backend CRUD

- [x] `bookRoutes.js` – GET, POST, PUT, DELETE
- [x] Backend-validering (titel/författare krävs)
- [x] JWT-auth + demo-inloggning
- [x] Google Books-sökning via säker proxy
- [x] 26 backend-tester (Vitest & Supertest)

### Sprint 3 – Frontend MVP

- [x] React + Tailwind + TanStack Query
- [x] Dashboard med bokkort och statusflikar
- [x] BookForm (sök → välj bok / manuellt läge)
- [x] BookCard – redigera, ta bort (inkl. demo-konto)
- [x] Omslagsbilder (vertikalt format)
- [x] 21 frontend-tester

### Dokumentation & repo

- [x] Portfolio-README pushad till [github.com/Dinolisk/BookStack](https://github.com/Dinolisk/BookStack)

### Sprint 4 – Betyg & recensioner

- [x] Databas: `rating` (1–5) och `review` (text) – se `backend/sql/migrate-rating-review.sql`
- [x] Backend: validering + PUT-stöd
- [x] Frontend: stjärnor och recension i BookCard
- [x] Tester (36 backend + 23 frontend = **59 totalt**)

---

## 📋 Nästa steg

- [ ] Playwright E2E-tester (inloggning → lägg till bok → se bok)
- [ ] Full registrering/inloggning (Supabase Auth)
- [ ] Responsiv polish (mobil)
- [ ] Deployment – Render (backend) + Vercel (frontend)
- [ ] Live-länkar i README
