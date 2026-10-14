# Task Manager — Backend

FastAPI + SQLite REST API. See **[../CLAUDE.md](../CLAUDE.md)** for architecture, layering conventions, and the API reference.

## Setup & run

```bash
# 1. Activate the virtual environment (already has dependencies installed)
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# (first time only, or after changing requirements.txt)
pip install -r requirements.txt

# 2. Start the server
uvicorn app.main:app --reload --port 8000
```

`--reload` restarts the server automatically on file changes.
`tasks.db` is created automatically in this directory on first run.
Docs: **http://localhost:8000/docs**

Copy `.env.example` to `.env` to override `CORS_ORIGINS` / `DATABASE_URL`.
