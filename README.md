# Task Manager App

A full-stack task manager built to learn modern web development. Create, edit, complete, and delete tasks — with data persisted in a real database.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python · FastAPI · SQLAlchemy · SQLite |
| Frontend | React 18 · Vite · plain CSS |

## Project structure

```
task-manager-app/
├── backend/          # FastAPI REST API
│   ├── main.py       # Route handlers + CORS config
│   ├── models.py     # SQLAlchemy Task model
│   ├── schemas.py    # Pydantic request/response shapes
│   ├── database.py   # DB engine + session dependency
│   └── requirements.txt
│
└── frontend/         # React + Vite UI
    ├── src/
    │   ├── App.jsx   # All components + state
    │   └── App.css   # Styles
    └── package.json
```

## Getting started

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API runs at **http://localhost:8000**  
Interactive docs at **http://localhost:8000/docs**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

UI runs at **http://localhost:3000**

## API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/tasks` | List all tasks |
| `POST` | `/tasks` | Create a task |
| `PUT` | `/tasks/{id}` | Update title / description |
| `PATCH` | `/tasks/{id}/complete` | Toggle completed |
| `DELETE` | `/tasks/{id}` | Delete a task |

## Features

- Add tasks with a title and optional description
- Mark tasks complete (or undo)
- Edit tasks inline
- Delete tasks
- Data persists in a local SQLite file (`backend/tasks.db`)
