# BUG-002: No `try/except`/rollback around `db.commit()` in any mutating endpoint

**Severity:** High
**Component:** Backend
**Affected files:** `backend/main.py:38-44` (`create_task`), `main.py:60-61` (`update_task`), `main.py:73-74` (`delete_task`), `main.py:86-88` (`toggle_complete`), `backend/database.py:22-32` (`get_db`)

## Description

Every mutating endpoint in `backend/main.py` calls `db.commit()` (and often `db.refresh()`) with no `try/except`:

```python
db.add(db_task)
db.commit()
db.refresh(db_task)
return db_task
```

If `commit()` raises for any reason (constraint violation — see BUG-001's `title=null` case, a locked SQLite file, disk I/O failure, etc.), the exception propagates unhandled out of the endpoint. FastAPI turns this into a generic `500` with no useful detail for the client (see also BUG-004, which compounds this on the frontend).

Additionally, `get_db()` in `backend/database.py`:

```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

only closes the session in `finally` — it never calls `db.rollback()`. A session with a failed transaction is closed without being explicitly rolled back first.

## Failure Scenario

1. Trigger any commit failure (e.g. the `title: null` case from BUG-001, or run two processes against the same SQLite file to force a lock timeout).
2. The client receives a bare `500 Internal Server Error` with no indication of what went wrong or whether the write partially applied.
3. There is no code path anywhere in the backend that would let a caller distinguish "your input was invalid" from "the server had an internal fault" — both look identical.

## Expected vs Actual

- **Expected:** a failed write is caught, the session is rolled back explicitly, and the client gets a meaningful error response (e.g. `400`/`409`/`500` with a `detail` message appropriate to the failure).
- **Actual:** any commit failure is an unhandled exception with no rollback and no useful client-facing detail.

## Suggested Fix

Wrap each commit in a `try/except SQLAlchemyError`, roll back, and re-raise as an `HTTPException`:

```python
from sqlalchemy.exc import SQLAlchemyError

@app.post("/tasks", response_model=schemas.TaskResponse, status_code=201)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create task")
    db.refresh(db_task)
    return db_task
```

Apply the same pattern to `update_task`, `delete_task`, and `toggle_complete`.

## Acceptance Criteria

- A forced commit failure (e.g. via a monkeypatched `db.commit` in a test, or the BUG-001 repro) results in a clean `4xx`/`5xx` JSON response with a `detail` field, not a bare unhandled traceback.
- The session is rolled back before being closed on any commit failure.
- Successful requests are unaffected.
