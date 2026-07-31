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

## Quick start

1. Configure the backend environment:

```bash
   cp backend/.env.example backend/.env
   # fill in Supabase keys and generate an encryption key:
   python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

   ⚠️ Losing `ENCRYPTION_KEYS` means losing all vault data. Back it up separately.

2. Build & run both services:

```bash
   docker compose up --build
```

3. Open:
   - Web app: http://localhost:3000
   - API docs: http://localhost:8000/docs
   - Health: http://localhost:8000/health

## API (v1)

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Service health check |
| POST | `/api/v1/passwords/generate` | Generate a secure password (+ strength score) |
| POST | `/api/v1/backup-codes/generate` | Generate 2FA-style backup codes |
| GET / POST | `/api/v1/sites` | List / create vault entries |
| GET / PUT / DELETE | `/api/v1/sites/{id}` | Read / update / remove an entry |

Secrets (passwords, backup codes) are encrypted at rest with Fernet.
Site storage is in-memory for now; Supabase persistence is the next milestone.

## Development

```bash
# backend tooling
pip install -r backend/requirements-dev.txt
ruff check backend/ && ruff format --check backend/

# frontend (hot reload, backend must run on :8000)
cd frontend && npm install && npm run dev
```

CI runs ruff, mypy, and the frontend build on every push and pull request.
Failures are posted to Slack via the GitHub app.

## Roadmap

- [ ] Supabase persistence for vault entries
- [ ] Backend test suite (pytest) in CI
- [ ] Authentication & row-level security
- [ ] End-to-end encryption (client-side, zero-knowledge)