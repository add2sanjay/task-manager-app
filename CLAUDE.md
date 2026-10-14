# CLAUDE.md

Canonical reference for this repo. `README.md` and the per-package READMEs
only cover quick start — architecture, conventions, and API details live
here.

## Project overview

A full-stack task manager: create, edit, complete, and delete tasks, with
data persisted in a real database.

| Layer | Technology |
|---|---|
| Backend | Python · FastAPI · SQLAlchemy · SQLite |
| Frontend | React 18 · Vite · plain CSS |

# Development process

## Rules

- Never commit directly to `main`. Every change goes through a pull request.
- Ask before running destructive commands.

## Definition of Ready

- The ticket names the problem and who it affects.
- The acceptance criteria are concrete enough to test.
- Nothing only the product owner can decide is left open.

## Process

### Plan

1. Read the ticket and the code it touches.
2. Present the plan and wait for approval.

### Build

3. Create a branch named `fix/<ticket>` or `feat/<ticket>`.
4. Write a failing test, then make it pass.
5. Run the full test suite.

### Ship

6. Open a pull request that links the ticket.
7. Wait for approval before merging.

## Architecture

The backend is **layered** (routes → services → models/schemas), and the
frontend is **feature-based** (one folder per feature under `src/features/`).
Both are chosen so a second domain (e.g. `users`, `projects`) can be added
by following the same pattern without touching the `tasks` feature.

```
backend/
├── app/
│   ├── main.py                  # FastAPI app factory: CORS, table creation, router registration
│   ├── core/
│   │   ├── config.py            # env-overridable settings (CORS_ORIGINS, DATABASE_URL)
│   │   └── database.py          # engine, SessionLocal, Base, get_db dependency
│   ├── models/                  # SQLAlchemy ORM models (one file per entity)
│   │   └── task.py
│   ├── schemas/                 # Pydantic request/response shapes (one file per entity)
│   │   └── task.py
│   ├── services/                # business logic — the only layer that touches the DB session
│   │   └── task_service.py
│   └── api/
│       ├── deps.py              # shared FastAPI dependencies (get_db, future auth deps, etc.)
│       └── routes/              # APIRouters — thin, no DB queries, delegate to services
│           └── tasks.py
├── venv/                        # local virtualenv (gitignored)
├── requirements.txt
└── .env.example                 # documents CORS_ORIGINS / DATABASE_URL overrides

frontend/
└── src/
    ├── main.jsx                 # mounts <App/>
    ├── App.jsx                  # thin shell: layout chrome + feature composition
    ├── App.css                  # global styles
    ├── api/
    │   └── client.js            # shared API_BASE_URL, used by every feature's api/ module
    └── features/
        └── tasks/                # one folder per feature
            ├── api/              # fetch calls for this feature only
            ├── hooks/            # state + orchestration (useTasks) — the only layer with useState
            ├── components/       # presentational components, receive everything via props
            └── TasksPage.jsx     # composes hook + components for this feature
```

## Setup & run

**Backend**
```bash
cd backend
venv\Scripts\activate         # Windows — venv already exists with deps installed
# source venv/bin/activate    # macOS/Linux
uvicorn app.main:app --reload --port 8000
```
API: **http://localhost:8000** · Interactive docs: **http://localhost:8000/docs**

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
UI: **http://localhost:3000**

## API reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/tasks` | List all tasks |
| `POST` | `/tasks` | Create a task |
| `PUT` | `/tasks/{id}` | Update title / description / completed |
| `PATCH` | `/tasks/{id}/complete` | Toggle completed |
| `DELETE` | `/tasks/{id}` | Delete a task |

## Conventions

**Backend**
- Route handlers (`app/api/routes/*.py`) only parse/validate input and call a service function — no `db.query(...)` in a route.
- Business logic and all DB access live in `app/services/*.py`.
- `app/models/` (SQLAlchemy) and `app/schemas/` (Pydantic) are kept separate on purpose — the DB shape and the API contract can evolve independently.
- **Adding a new domain**: create `models/<name>.py`, `schemas/<name>.py`, `services/<name>_service.py`, `api/routes/<name>.py`, then register the router in `app/main.py` via `app.include_router(...)`. Import the new model module in `app/main.py` (like `task_model`) so SQLAlchemy registers its table before `create_all` runs.
- Config values (CORS origins, DB URL) belong in `app/core/config.py`, read from env vars with sane defaults — never hardcode them in route/service files.

**Frontend**
- One folder per feature under `src/features/<name>/`, each with its own `api/`, `hooks/`, `components/`.
- `hooks/use<Feature>.js` owns all `useState`/`useEffect` and calls the feature's `api/` module — components never call `fetch` directly.
- Components under `components/` are presentational: they take props and render, no data fetching.
- Code shared across more than one feature goes in `src/api/` (already holds `client.js`) or a new `src/components/` — only promote something out of a feature folder once a second feature actually needs it.

## Configuration

`backend/.env.example` documents the two overridable settings:
- `CORS_ORIGINS` — comma-separated allowed origins (default `http://localhost:3000`)
- `DATABASE_URL` — SQLAlchemy URL (default `sqlite:///./tasks.db`, resolved relative to `backend/`)

Copy to `.env` and adjust per environment; `app/core/config.py` reads these via `os.getenv`.

## Known issues

Bug reports from a prior full-stack audit live in `docs/`:
- `docs/health-report.md` — cross-cutting findings summary
- `docs/regression-issues/BUG-00*.md` — individual bug write-ups (e.g. a `PUT` null-handling crash, missing rollback on commit failure, missing frontend validation)

These predate this restructure and were **not** fixed as part of it (this was a structure-only change) — file/line references inside them point at the pre-restructure single-file layout. Treat them as a backlog, not as reflecting current file paths.

## Current limitations / next steps

- No authentication — anyone who can reach the API has full access.
- No migrations — schema changes currently require dropping `tasks.db`; **Alembic** is the natural next step once the schema needs to evolve without data loss.
- No automated tests yet. Recommended when added:
  - Backend: `pytest` + `httpx.TestClient` under `backend/tests/`, one test module per service (mirrors `app/services/`).
  - Frontend: **Vitest** + **React Testing Library**, co-located as `__tests__/` inside each feature folder.
