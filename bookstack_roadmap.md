BookStack Roadmap

Detta dokument styr utvecklingen av BookStack. Fokus ligger på en MVP som är testbar, robust och användarvänlig.

🏃‍♂️ Sprint 1: Fundament & Arkitektur

Mål: Sätta upp teknisk infrastruktur och säkerställa databaskoppling.

[ ] Backend-setup (Express, CORS, Miljövariabler).

[ ] Databasanslutning (Supabase/Postgres).

[ ] Grundläggande .gitignore och mappstruktur.

QA-fokus: Verifiera att databasanslutningen hanterar fel (t.ex. vid felaktig URL) graciöst.

🛠️ Sprint 2: Backend & CRUD (API)

Mål: Bygga logiken för bokhantering.

[ ] Skapa bookRoutes.js (GET, POST, PUT, DELETE).

[ ] Backend-validering (titel/författare krävs).

[ ] Implementera autentisering via Supabase Auth.

QA-fokus: Skriva integrationstester (Supertest) för varje CRUD-rutt. Inga endpoints utan test.

🎨 Sprint 3: Frontend MVP

Mål: Skapa ett responsivt och modernt gränssnitt.

[ ] React-setup med Tailwind CSS.

[ ] Dashboard-vy med bokkort.

[ ] Formulär för att lägga till/redigera böcker.

[ ] Demo-inloggning ("1-klick-knapp").

QA-fokus: UI-validering – formulär ska inte kunna skicka tomma titlar.

🧪 Sprint 4: QA, Testning & Polering

Mål: Säkerställa kvalitet och förbereda för presentation.

[ ] Skriva E2E-tester (Playwright) för de kritiska flödena (Logga in -> Lägg till bok -> Se bok).

[ ] Felhantering i UI (visa snygga felmeddelanden vid API-fel).

[ ] Responsivitetstestning (mobil/desktop).

QA-fokus: "Recruiter Proofing" – säkerställ att demo-kontot fungerar och att felmeddelanden är hjälpsamma.

🚀 Sprint 5: Deployment

Mål: Få upp appen på nätet.

[ ] Driftsätta backend på Render.

[ ] Driftsätta frontend på Vercel.

[ ] Uppdatera README.md med instruktioner och live-länk.