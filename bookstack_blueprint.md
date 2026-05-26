BookStack – Produktbeskrivning & Ritning

🎯 Vision

BookStack är en digital bokhylla för bokälskare som vill ha koll på sin läsning. Appen ska kännas ren, modern och användarvänlig, och fungera som ett bevis på utvecklarens förmåga att bygga robusta, testade fullstack-applikationer.

🚀 Kärnfunktionalitet (MVP - Minimum Viable Product)

Appen ska stödja följande huvudfunktioner för användaren:

1. Autentisering & Profil

Registrering & Login: Användare skapar ett säkert konto med email/lösenord (Supabase Auth).

Demo-inloggning: En "1-klick-knapp" för rekryterare så att de direkt kan testa appen med förifylld data.

2. Bokhantering (CRUD)

Lägga till: Skapa nya böcker (Titel, Författare).

Visa: Uppdelat i: Vill läsa, Läser nu, Har läst klart.

Redigera: Ändra status, lägga till betyg (1-5 stjärnor) och recension.

Ta bort: Radera en bok.

3. Gränssnitt (UX)

Dashboard: Snygg översikt med "kort" för böcker.

Status-sortering: Tydliga flikar eller kolumner.

Responsivitet: Ska fungera på desktop och mobil.

🧪 QA & Testning (Utvecklarens "Signatur")

Eftersom detta är ett portfolioprojekt är kodkvalitet viktigare än funktionernas mängd:

Backend-validering: Ingen bok får sparas utan Titel och Författare.

Felhantering: Tydliga felmeddelanden vid felaktig input.

Testbarhet: Varje endpoint ska ha integrationstester (Supertest) och kritisk UI-logik ska ha E2E-tester (Playwright).

🛠️ Arkitektur & Teknikstack

Backend: Node.js, Express, PostgreSQL (Supabase).

Frontend: React, Tailwind CSS.

Mappstruktur:

bookstack/
├── .cursor/rules/     # AI-instruktioner
├── backend/           # API-logik, databas, tester
├── frontend/          # UI, komponenter, anrop
└── bookstack_blueprint.md
