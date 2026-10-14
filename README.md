# Task Manager App

A full-stack task manager built to learn modern web development. Create, edit, complete, and delete tasks — with data persisted in a real database.

| Layer | Technology |
|---|---|
| Backend | Python · FastAPI · SQLAlchemy · SQLite |
| Frontend | React 18 · Vite · plain CSS |

## Quick start

```bash
# Backend — http://localhost:8000 (docs at /docs)
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

# Frontend — http://localhost:3000
cd frontend
npm install
npm run dev
```

See **[CLAUDE.md](./CLAUDE.md)** for architecture, folder structure, conventions, the full API reference, and known issues.
