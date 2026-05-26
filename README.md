# 📚 BookStack – Fullstack Personal Library Manager

BookStack är en modern fullstack-applikation för att organisera, söka och spåra din personliga boksamling. Projektet är byggt från grunden med fokus på ren kod, tydlig arkitektur och en automatiserad testsvit.

Detta projekt fungerar som ett bevis på förmågan att leverera robust mjukvara där utveckling och QA (Quality Assurance) går hand i hand.

## 🚀 Live Demo & Snabblänkar

| | |
|---|---|
| **Live App** | [LÄGG_TILL_DIN_NETLIFY_LÄNK_HÄR](https://example.com) |
| **Backend API** | [LÄGG_TILL_DIN_RENDER_LÄNK_HÄR](https://example.com) |
| **QA Testrapport** | Se sektionen [Kvalitetssäkring & QA](#-kvalitetssäkring--qa) längre ner |
| **Repository** | [github.com/Dinolisk/BookStack](https://github.com/Dinolisk/BookStack) |

> **💡 Recruiter Hint:** Du behöver inte registrera ett konto. Klicka på **"Prova demo (demo@bookstack.com)"** på inloggningssidan för att logga in direkt och testa hela bokhyllan.

---

## ✨ Huvudfunktioner (MVP)

### 1. 🔑 Autentisering & Demo-läge

- **Registrering & inloggning** – Eget auth-system med bcrypt-hashade lösenord och JWT-tokens.
- **JWT-baserad session** – Tokens sparas i `localStorage` med automatisk sessionåterställning vid omladdning (`GET /api/auth/me`).
- **1-klicks demo-inloggning** – Rekryterare kan testa appen direkt utan registrering.
- **Användarscopad data** – Varje bok tillhör inloggad användare (`user_id`) och filtreras i backend.

### 2. 📖 Bokhantering (CRUD)

- **Status-sortering** – Organisera böcker i *Vill läsa*, *Läser* och *Har läst klart*.
- **Client-side filtrering** – Flikar (inkl. *Alla*) filtrerar och räknar böcker i realtid utan extra API-anrop, via TanStack Query-cache.
- **Lägg till via sök eller manuellt** – Google Books-sökning fyller i titel, författare och omslag automatiskt; manuellt läge finns om boken inte hittas.
- **Redigera & ta bort** – Inline-redigering i kortet och bekräftelse innan permanent radering.

### 3. ⭐ Betyg & Recensioner

- **1–5 stjärnor** – Interaktiv stjärnkomponent med visuell feedback.
- **Fritext-recension** – Valfritt omdöme som visas på kortet och i detaljvyn.
- **Domänlogik** – Betyg och recension är enbart tillgängliga för böcker med status *Har läst klart*, både i UI och backend.

### 4. 🔍 Google Books API (säker proxy)

- **Realtidssökning** – Sök böcker med debounce och välj träff i listan.
- **Smart omslagslösning** – Backend försöker först hämta högupplöst omslag från Open Library via ISBN; faller tillbaka på Google Books-omslaget om inget hittas.
- **Säker proxy-arkitektur** – API-nyckeln exponeras aldrig i frontend. React anropar Express, som i sin tur anropar Google Books API och returnerar ett normaliserat JSON-format.

### 🔜 Planerat (ej implementerat ännu)

- Playwright E2E-tester

---

## 🛠️ Teknikstack

### Frontend

| Teknik | Användning |
|---|---|
| **React (Vite)** | SPA med ES Modules |
| **Tailwind CSS** | Responsiv UI; bokomslag i `aspect-[2/3]` med `object-contain` |
| **TanStack Query** | Server-state, caching och cache-invalidering vid mutationer |
| **React Context** | Global auth-session |

### Backend

| Teknik | Användning |
|---|---|
| **Node.js & Express** | REST API med strukturerade rutter och middleware |
| **PostgreSQL (Supabase)** | Relationsdatabas via session pooler |
| **JWT (`jsonwebtoken`)** | Token-generering och verifiering |
| **Vitest & Supertest** | Integrationstester mot API |

---

## 🧪 Kvalitetssäkring & QA

BookStack har **88 automatiserade tester** som täcker API-kontrakt, auth, sökning och kritisk UI-logik.

### Backend – 54 tester (Vitest & Supertest)

Testerna kör mot Express-appen med mockad databas (`vi.mock`).

**Täckning:**

- Hälsokontroll (`GET /`) och 404 för okända rutter
- CRUD för böcker med validering (tom titel/författare → `400`)
- JWT-skyddade rutter (kräver giltig `Bearer`-token)
- Registrering (`POST /api/auth/register`) – dubblettmail, ogiltigt email, för kort lösenord
- Inloggning (`POST /api/auth/login`) – fel lösenord, okänd användare
- Demo-auth (`POST /api/auth/demo`, `GET /api/auth/me`)
- Google Books-sökning (`GET /api/books/search`)
- Betyg/recension rensas i databasen när status ändras från *Har läst klart*
- Open Library cover-fallback (riktigt omslag vs platshållare vs nätverksfel)
- Simulerade databasfel → `500` utan serverkrasch

### Frontend – 34 tester (Vitest & React Testing Library)

**Täckning:**

- **BookForm** – Validering, sök-/manuellt läge, laddningstillstånd
- **BookCard** – Inline-redigering, raderingsbekräftelse, betyg/recension synlighet baserat på status, statusbyte rensar fält
- **BookSearch** – Sökresultat och val av bok
- **BookList** – Flikfiltrering och tomma tillstånd
- **LoginPage** – Demo-inloggning, login-flödet, registrering, lösenordsmismatch
- **bookStatus** – Statusräkning och filtrering

```bash
cd backend && npm test   # 54 tester
cd frontend && npm test  # 34 tester
```

---

## 📐 Arkitektur & Säkerhetsbeslut

### 🔒 API-nycklar (proxy-mönster)

Google Books API-nyckeln lagras endast i backend `.env`:

```
[Frontend React] ── sökfråga ──> [Express API] ── hemlig nyckel ──> [Google Books API]
[Frontend React] <── ren JSON ── [Express API] <── rå JSON ──────── [Google Books API]
```

Detta skyddar nyckeln, centraliserar felhantering och låter backend normalisera svaret innan det når klienten.

### 🛡️ Felhantering i UI

- Formulärvalidering stoppar tomma fält innan API-anrop
- Bekräftelsedialog innan permanent radering
- Tydliga felmeddelanden från API visas via `role="alert"`
- Mutationer sätter knappar i disabled/laddningstillstånd under pågående request

---

## 💾 Databas-schema (PostgreSQL)

Kör `backend/schema.sql` i Supabase SQL Editor. Valfritt demo-innehåll: `backend/sql/seed-demo-books.sql`.

```sql
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Vill läsa',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id UUID,
  cover_image_url TEXT,
  isbn TEXT,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  review TEXT
);
```

---

## 💻 Kom igång lokalt

### Förutsättningar

- Node.js v18+
- Supabase-konto (eller lokal PostgreSQL)
- Google Books API-nyckel ([Google Cloud Console](https://console.cloud.google.com))

### 1. Klona och installera

```bash
git clone https://github.com/Dinolisk/BookStack.git
cd BookStack
```

### 2. Databas

Kör i Supabase SQL Editor:

1. `backend/schema.sql`
2. (Valfritt) `backend/sql/seed-demo-books.sql` – ersätt `:demo_user_id` med ditt `DEMO_USER_ID`

### 3. Backend

Kopiera `backend/.env.example` till `backend/.env` och fyll i:

```env
PORT=5001
DATABASE_URL=din_supabase_session_pooler_url
JWT_SECRET=din_hemliga_jwt_signeringstext
DEMO_USER_ID=11111111-1111-1111-1111-111111111111
DEMO_USER_EMAIL=demo@bookstack.com
GOOGLE_BOOKS_API_KEY=din_google_books_api_nyckel
```

```bash
cd backend
npm install
npm run dev
```

API: **http://localhost:5001**

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: **http://localhost:5173** (Vite proxar `/api` → backend)

### 5. Kör testerna

```bash
cd backend && npm test
cd frontend && npm test
```

---

## 📁 Projektstruktur

```
BookStack/
├── backend/           # Express API, PostgreSQL, JWT, tester
├── frontend/          # React + Vite + Tailwind
├── bookstack_blueprint.md
└── README.md
```

## Licens

Privat / portfolioprojekt.
