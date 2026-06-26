# Task Manager — Backend

A simple REST API built with **FastAPI** + **SQLite** to learn Python web development.

## Tech choices explained

| Tool | Why |
|---|---|
| **FastAPI** | Modern Python framework with automatic validation and interactive docs at `/docs` |
| **SQLite** | Zero-config file-based database — perfect for local dev, no server to run |
| **SQLAlchemy** | Python ORM that lets you work with database rows as Python objects |
| **Pydantic** | FastAPI uses it to validate request/response data and produce clear error messages |

## File structure

```
backend/
├── main.py        # FastAPI app, all route handlers live here
├── models.py      # SQLAlchemy model (maps Python class → DB table)
├── schemas.py     # Pydantic schemas (define API request/response shapes)
├── database.py    # Engine, session factory, and get_db dependency
└── requirements.txt
```

## Setup & run

```bash
# 1. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the server
uvicorn main:app --reload --port 8000
```

`--reload` makes the server restart automatically when you save a file — great for development.

The `tasks.db` SQLite file is created automatically in this directory on first run.

## Explore the API

Once running, open **http://localhost:8000/docs** in your browser.
FastAPI generates interactive Swagger docs from your code — you can test every endpoint there.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/tasks` | List all tasks |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/{id}` | Update title/description/completed |
| DELETE | `/tasks/{id}` | Delete a task |
| PATCH | `/tasks/{id}/complete` | Toggle completed status |

## Key concepts to explore next

- **Dependency injection** (`Depends(get_db)`) — how FastAPI wires per-request resources
- **Alembic** — database migration tool for when your schema changes in production
- **pytest** + **httpx** — testing FastAPI endpoints
