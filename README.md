📚 BookStack – Fullstack Personal Library Manager

BookStack är en modern, fullstack-applikation för att organisera, söka och spåra din personliga boksamling. Projektet är byggt från grunden med fokus på ren kod, skalbar arkitektur och – viktigast av allt – en rigorös test- och kvalitetssäkringsprocess.

Detta projekt fungerar som ett bevis på min förmåga att leverera robust, produktionsredo mjukvara där utveckling och QA (Quality Assurance) går hand i hand.

🚀 Live Demo & Snabblänkar

Live App: [LÄGG_TILL_DIN_VERCEL_LÄNK_HÄR]

Backend API: [LÄGG_TILL_DIN_RENDER_LÄNK_HÄR]

QA Testrapport: Se sektionen Kvalitetssäkring & QA längre ner.

💡 Recruiter Hint: Du behöver inte registrera ett konto för att testa appen. Klicka på den gröna "Prova demo (1-klick)"-knappen på inloggningssidan för att direkt logga in på en fullt förifylld bokhylla i säkert demoläge!

✨ Huvudfunktioner (MVP)

1. 🔑 Säker Autentisering & Demo-läge

JWT-baserad Auth: Säker autentisering med JSON Web Tokens sparat i klientsidans localStorage med automatisk sessionåterställning vid omladdning.

1-Klicks Gästinloggning: En sömlös demo-funktion som låter rekryterare uppleva appen direkt med autentisk förifylld data.

Skrivskyddat Demoläge (QA-tänk): Demokontot har spärrar i backenden som blockerar permanent radering av data (403 Forbidden), vilket skyddar demo-miljön från sabotage.

2. 📖 Bokhantering & Smarta Bokhyllor (CRUD)

Status-sortering: Organisera dina böcker i tre kategorier: Vill läsa, Läser just nu och Har läst klart.

Client-side filtrering: Snabba flikar som filtrerar och räknar böckerna i realtid utan extra API-anrop, tack vare effektiv cache-hantering med TanStack Query.

Betyg & Recensioner: Möjlighet att betygsätta (1–5 stjärnor) och skriva omdömen för färdiglästa böcker.

3. 🔍 Google Books API Integration (Säker Proxy)

Automatisk ifyllnad: Sök efter böcker i realtid och hämta automatiskt titel, författare och omslagsbilder.

Säker Proxy-arkitektur: API-nyckeln är 100 % dold från klientsidan. Frontenden pratar med Express-backenden, som säkert sköter sökningen mot Google Books API och formaterar datan innan den skickas tillbaka.

🛠️ Teknikstack

Frontend

React (Vite) – Snabbt, modernt SPA-ramverk med ES Modules.

Tailwind CSS – Utility-first CSS för responsiv design (pixel-perfekt utan svarta kanter på bokomslag via aspect-[2/3] och object-cover).

TanStack Query (React Query) – Deklarativ server-state hantering, caching och automatisk cache-invalidering vid CRUD-mutationer.

React Context API – Global tillståndshantering för användar- och auth-sessioner.

Backend

Node.js & Express – Modulär serverarkitektur med strukturerade rutter och middlewares.

PostgreSQL & Supabase – Kraftfull relationsdatabas kopplad via en optimerad anslutningspool (Session Pooler) för stabil lokal och molnbaserad drift.

JWT (jsonwebtoken) – Generering och verifiering av säkra access-tokens.

🧪 Kvalitetssäkring & QA (Mitt hemliga vapen)

Som en utvecklare med bakgrund inom QA (Software Testing) anser jag att kod som inte är testad inte är redo för produktion. BookStack har en omfattande, automatiserad testsvit på totalt 39 tester som täcker kritiska flöden, edge-cases och felhantering.

1. Backend Integrationstester (21 st – Vitest & Supertest)

Hela API-kontraktet är kvalitetssäkrat. Testerna körs mot Express-appen med en helt isolerad och mockad databasanslutning (vi.mock).

Täckning:

Hälso-check (GET /) och okända rutter (404-hantering).

Strikt validering (t.ex. att POST och PUT stoppar tomma titlar/författare med 400 Bad Request).

Autentisering och behörighetskontroller (skyddade rutter kräver giltig Bearer-token).

Robusta felhanteringstester (simulerade databas-fel returnerar 500 Internal Server Error istället för att krascha servern).

2. Frontend Enhet- & Komponenttester (18 st – Vitest & React Testing Library)

Täckning:

BookForm: Verifierar frontend-validering (stoppar tomma fält innan API-anrop görs), laddningslägen (isPending sätter knappen till disabled) och rendering av felmeddelanden.

BookCard: Testar inline-redigering, bekräftelse-modaler vid radering och defensiv programmering (guard clauses om datan tillfälligt är undefined).

StatusTabs: Testar interaktion, flikbyten och korrekt rendering av tomma tillstånd ("Inga böcker med denna status").

📐 Arkitektur & Säkerhetsbeslut

🔒 Dölja API-nycklar (Proxy-mönstret)

Att exponera en Google-nyckel i källkoden i React är en stor säkerhetsrisk. Jag designade därför en API Proxy i min backend:

[Frontend (React)] ──(Sökfråga)──> [Backend (Express)] ──(Hemlig Nyckel)──> [Google Books API]
[Frontend (React)] <──(Ren JSON)── [Backend (Express)] <──(Tung JSON)─────── [Google Books API]


Detta skyddar nyckeln, begränsar användningen och gör att jag kan transformera Googles tunga JSON-respons till ett mycket lättare och renare format innan det når användarens webbläsare.

🛡️ Defensiv React-programmering

För att undvika att appen kraschar vid asynkrona laddningstider eller trasig data, har BookCard utrustats med en kraschsäker guard clause:

if (!book) return null; // Förhindrar krascher om datan är tillfälligt tom


All rendering och status-initiering använder dessutom optional chaining (book?.title) och logiska fallbacks (book?.author || 'Okänd författare').

💾 Databas-schema (PostgreSQL)

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  status TEXT DEFAULT 'Vill läsa',
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);


💻 Kom igång lokalt

Förutsättningar

Node.js (v18 eller senare)

Ett gratis Supabase-konto (eller lokal Postgres)

1. Klona och installera

git clone https://github.com/DITT_ANVÄNDARNAMN/bookstack.git
cd bookstack


2. Konfigurera Backend

Skapa en .env-fil i /backend:

PORT=5001
DATABASE_URL=din_supabase_session_pooler_url
JWT_SECRET=din_hemliga_jwt_signeringstext
DEMO_USER_ID=11111111-1111-1111-1111-111111111111
DEMO_USER_EMAIL=demo@bookstack.com
GOOGLE_BOOKS_API_KEY=din_google_books_api_nyckel


Starta backenden:

cd backend
npm install
npm run dev


3. Konfigurera Frontend

Starta frontenden:

cd ../frontend
npm install
npm run dev


Öppna sedan http://localhost:5173 i din webbläsare!

4. Kör testerna 🧪

För att verifiera kvaliteten och köra testsviterna:

# Backend-tester
cd backend
npm test

# Frontend-tester
cd frontend
npm test

