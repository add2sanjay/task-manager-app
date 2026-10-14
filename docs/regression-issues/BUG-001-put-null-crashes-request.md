# BUG-001: `PUT /tasks/{id}` crashes with an unhandled 500 when a field is explicitly set to `null`

**Severity:** High
**Component:** Backend
**Affected files:** `backend/main.py:57-58`, `backend/schemas.py:16-20`, `backend/models.py:11,13`

## Description

`update_task` in `backend/main.py` applies partial updates using:

```python
for field, value in task.model_dump(exclude_unset=True).items():
    setattr(db_task, field, value)
```

`exclude_unset=True` only drops fields the client **omitted** from the request body. It does **not** drop fields the client explicitly set to `null`. Since `schemas.TaskUpdate` (`schemas.py:16-20`) declares `title`, `description`, and `completed` as `Optional`, a client can legally send `null` for any of them, and that `null` will be written straight onto the SQLAlchemy model via `setattr`.

## Failure Scenario

1. Start the backend (`uvicorn main:app --reload --port 8000`) and create a task via `POST /tasks`.
2. Send `PUT /tasks/{id}` with body `{"completed": null}`.
   - `models.Task.completed` is nullable, so this write succeeds at the DB layer.
   - But `schemas.TaskResponse.completed` (`schemas.py:28`) is declared as a required `bool`, not `Optional`. FastAPI's response validation then fails while serializing the row back out, and the client gets an **unhandled 500 Internal Server Error** instead of the updated task.
3. Send `PUT /tasks/{id}` with body `{"title": null}`.
   - `models.Task.title` is `Column(String, nullable=False)` (`models.py:11`).
   - `setattr(db_task, "title", None)` followed by `db.commit()` raises `sqlalchemy.exc.IntegrityError` (`NOT NULL constraint failed`).
   - Nothing in `main.py` catches this, so it also surfaces as an **unhandled 500**, and the DB session is never rolled back (see BUG-002).

Both requests are syntactically valid per the `TaskUpdate` schema and require no malformed input — a well-behaved client that decides to "clear" an optional field with `null` will trip this.

## Expected vs Actual

- **Expected:** either the API rejects `null` for fields that can't be null with a clean `422`, or `null` is treated the same as "not provided" (ignored) so it never reaches the model.
- **Actual:** the app crashes with an unhandled `500` and, for the `title` case, an uncommitted/failed transaction.

## Suggested Fix

Filter out explicit `None` values for fields where `None` is not a valid persisted state, on top of `exclude_unset`:

```python
update_data = task.model_dump(exclude_unset=True)
update_data = {k: v for k, v in update_data.items() if v is not None or k == "description"}
for field, value in update_data.items():
    setattr(db_task, field, value)
```

(`description` is legitimately nullable in the model, so it's the one field allowed to be explicitly cleared to `None`; `title` and `completed` are not.)

## Acceptance Criteria

- `PUT /tasks/{id}` with `{"completed": null}` returns a `422` (or is treated as a no-op for that field) — never a `500`.
- `PUT /tasks/{id}` with `{"title": null}` returns a `422` (or is treated as a no-op) — never a `500`/`IntegrityError`.
- Existing valid partial updates (e.g. `{"title": "new title"}`) continue to work unchanged.
