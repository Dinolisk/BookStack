# BookStack

Digital bokhylla för att hålla koll på vad du vill läsa, läser och har läst klart.

**Stack:** React · Tailwind CSS · Express · PostgreSQL (Supabase) · Vitest

## Funktioner

- Demo-inloggning med ett klick
- Lägg till böcker via Google Books-sökning (omslag hämtas automatiskt)
- Manuellt läge om boken inte finns i Google Books
- Statusflikar: Vill läsa · Läser · Har läst klart
- Redigera och ta bort böcker
- Backend- och frontend-tester

## Kom igång

### 1. Databas (Supabase)

Kör SQL i Supabase SQL Editor:

```bash
backend/schema.sql
```

Valfritt demo-innehåll:

```bash
backend/sql/seed-demo-books.sql
```

(Ersätt `:demo_user_id` med ditt `DEMO_USER_ID` från `.env`.)

### 2. Backend

```bash
cd backend
cp .env.example .env   # Windows: copy .env.example .env
npm install
npm run dev
```

API körs på **http://localhost:5001**

Miljövariabler – se `backend/.env.example`:

| Variabel | Beskrivning |
|---|---|
| `PORT` | Serverport (standard 5001) |
| `DATABASE_URL` | PostgreSQL connection string (session pooler rekommenderas på Windows) |
| `JWT_SECRET` | Hemlig nyckel för JWT |
| `DEMO_USER_ID` | UUID för demokontot |
| `DEMO_USER_EMAIL` | E-post för demo (standard `demo@bookstack.com`) |
| `GOOGLE_BOOKS_API_KEY` | API-nyckel från [Google Cloud Console](https://console.cloud.google.com) (Books API) |

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Appen körs på **http://localhost:5173** och proxar `/api` till backend.

## Tester

```bash
cd backend && npm test    # 26 tester
cd frontend && npm test   # 21 tester
```

## Projektstruktur

```
BookStack/
├── backend/          # Express API, PostgreSQL, JWT-auth
├── frontend/         # React + Vite + Tailwind
├── bookstack_blueprint.md
└── README.md
```

## Licens

Privat/portfolioprojekt.
