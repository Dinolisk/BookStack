# BookStack – Projektplan

> Uppdatera detta dokument när krav, arkitektur eller prioriteringar ändras.

## Vision
En personlig app för att hantera, söka och läsa böcker.

## Mappstruktur
```
bookstack/
├── .cursor/
│   └── rules/            # AI-instruktioner (Cursor rules)
├── bookstack_blueprint.md
├── backend/              # Node.js / Express
└── frontend/             # React / Tailwind
```

## Backend (`backend/`)
- **Stack:** Node.js, Express
- **Ansvar:** API, auth, databas, affärslogik

### Planerade endpoints
| Metod | Route | Beskrivning |
|-------|-------|-------------|
| GET   | `/api/books` | Lista böcker |
| POST  | `/api/books` | Lägg till bok |
| GET   | `/api/books/:id` | Hämta en bok |

## Frontend (`frontend/`)
- **Stack:** React, Tailwind CSS
- **Ansvar:** UI, routing, anrop till backend

### Planerade sidor
- [ ] Boklista
- [ ] Bokdetalj
- [ ] Lägg till / redigera bok

## Databas
- [ ] Välj databas (t.ex. SQLite, PostgreSQL)
- [ ] Datamodell för böcker

## Nästa steg
1. Initiera backend-projekt (Express + TypeScript)
2. Initiera frontend-projekt (Vite + React + Tailwind)
3. Koppla ihop API och UI
