# Seald

A backup code & password manager.

- **Backend** — Python / FastAPI + Supabase
- **Frontend** — React SPA (Vite + MUI, based on the Material UI checkout template)
- **Infra** — Docker & docker-compose

## Project structure

```
seald/
├── .github/            # CI workflows (placeholder)
├── assets/             # logos, screenshots
├── backend/
│   ├── app/
│   │   ├── api/v1/     # versioned API routes
│   │   ├── core/       # settings/config
│   │   ├── services/   # password generator, supabase client
│   │   └── main.py     # FastAPI entrypoint
│   ├── .env.example
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/           # React SPA (Vite + MUI)
├── docker-compose.yml
└── README.md
```

## Quick start (backend)

1. Copy env file and fill in your Supabase credentials:

   ```bash
   cp backend/.env.example backend/.env
   ```

2. Build & run:

   ```bash
   docker compose up --build
   ```

3. Check it works:

   - Health: http://localhost:8000/health
   - Interactive API docs: http://localhost:8000/docs

## API endpoints (v1)

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Service health check |
| POST | `/api/v1/passwords/generate` | Generate a secure password (+ strength score) |
| POST | `/api/v1/backup-codes/generate` | Generate 2FA-style backup codes |
| GET | `/api/v1/sites` | List all saved sites |
| POST | `/api/v1/sites` | Save a new site |
| GET/PUT/DELETE | `/api/v1/sites/{id}` | Read / update / remove a site |

> Site storage is in-memory for now; it will move to Supabase in a later step.

## Web app

Runs at http://localhost:3000 (`docker compose up --build` starts both services).
Local dev without Docker: `cd frontend && npm install && npm run dev` (backend must run on :8000).

Screens:
1. **Dashboard** — all saved sites with show/hide + copy password, edit and remove actions
2. **Add site** — site, username, password (with "Generate new password" button calling the API, plus a live strength chip), backup codes, note
3. **Edit site** — same form pre-filled; remove has a confirmation dialog
