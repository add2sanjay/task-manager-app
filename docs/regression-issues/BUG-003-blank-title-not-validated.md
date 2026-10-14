# BUG-003: Blank or whitespace-only task titles are accepted and persisted

**Severity:** Medium
**Component:** Backend
**Affected files:** `backend/schemas.py:10-20` (`TaskCreate`, `TaskUpdate`), `backend/models.py:11`

## Description

`TaskCreate.title` and `TaskUpdate.title` are declared as plain `str` with no `min_length`, no `max_length`, and no whitespace stripping:

```python
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    ...
```

`models.Task.title` only enforces `nullable=False` at the DB layer, which an empty string (`""`) satisfies. There is no validation anywhere in the request path that rejects a blank or whitespace-only title.

## Failure Scenario

1. `POST /tasks` with `{"title": ""}` — passes Pydantic validation (any `str`, including empty, is valid), passes the DB's `NOT NULL` check (empty string isn't `NULL`), and returns `201` with a task that has no visible title.
2. `POST /tasks` with `{"title": "   "}` (whitespace only) — same result; the task is persisted with a title that renders as blank in the UI.
3. `PUT /tasks/{id}` with `{"title": ""}` on an existing task overwrites a previously valid title with a blank one, with no error.

There is also no upper bound: a multi-megabyte string is accepted for both `title` and `description` with no size limit anywhere in the stack.

## Expected vs Actual

- **Expected:** creating or updating a task with a blank/whitespace-only title returns a `422` with a clear validation message.
- **Actual:** the request succeeds and a task with an effectively empty title is silently persisted.

## Suggested Fix

Add length constraints and a stripping/non-blank validator in `backend/schemas.py`:

```python
from pydantic import BaseModel, Field, field_validator

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("title must not be empty or whitespace")
        return v


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    completed: Optional[bool] = None

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, v):
        if v is not None and not v.strip():
            raise ValueError("title must not be empty or whitespace")
        return v
```

## Acceptance Criteria

- `POST /tasks` with `{"title": ""}` or `{"title": "   "}` returns `422`.
- `PUT /tasks/{id}` with `{"title": ""}` or `{"title": "   "}` returns `422`.
- A valid title with leading/trailing whitespace (e.g. `" Buy milk "`) is stored trimmed as `"Buy milk"`.
- Existing valid create/update requests are unaffected.
