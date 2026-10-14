# Full Stack Health Report

## Summary
The app is a clean, small CRUD scaffold with consistent naming and a reasonable schema/response separation on the backend, and a functional single-component UI on the frontend. Neither layer validates input rigorously, and neither layer talks to the other's error format — the backend can produce structured `detail` messages and even raw 500s, but the frontend discards every response body and shows one of five hardcoded strings regardless of what actually went wrong. The single most urgent issue is the backend's `exclude_unset` bug in `PUT /tasks/{id}`, which can crash a request with an unhandled 500 on a syntactically valid body.

## Backend Findings

**API Design Quality** — RESTful naming and correct status codes (201/204/200), but `PUT /tasks/{id}` (`main.py:48`) implements partial-update (PATCH) semantics via `exclude_unset=True`, not full-replace PUT semantics. There's no `GET /tasks/{task_id}` single-resource read, and `GET /tasks` has no pagination.

**Missing Validations** — `TaskCreate.title`/`TaskUpdate.title` (`schemas.py:12,18`) have no `min_length`/`max_length`/whitespace stripping, so blank or arbitrarily large titles are accepted and persisted. `task_id` path params (`main.py:49,67,80`) aren't constrained to positive integers.

**Error Handling Gaps** — The critical bug: `exclude_unset=True` (`main.py:57`) treats an explicit `null` as "set," so `PUT /tasks/{id}` with `{"completed": null}` or `{"title": null}` passes Pydantic validation, then either fails `TaskResponse` serialization (`completed: bool` isn't optional) or violates the DB's `NOT NULL` on `title` — both surface as an **unhandled 500**, since none of the four mutating endpoints wrap `db.commit()` in try/except, and `get_db()` (`database.py:22-32`) never calls `rollback()`.

**Top 3 suggested fixes**: (1) reject blank/oversized titles via `Field(min_length=1, max_length=200)` + a validator; (2) wrap every `db.commit()` in try/except with explicit rollback, returning a clean error instead of a raw 500; (3) add `GET /tasks/{task_id}` with `Path(..., gt=0)`.

## Frontend Findings

**Component Structure** — The entire UI is one 178-line `App` component (`App.jsx:6-177`) with no decomposition. `editingId`/`editTitle`/`editDesc` (lines 13-15) duplicate data already in `tasks`, and every mutation discards its own response and re-fetches the whole list instead of updating local state.

**Missing Loading/Error States** — No loading flag exists at all; `tasks.length === 0` (`App.jsx:126`) can't distinguish "still loading" from "confirmed empty." No button (Add/Toggle/Delete/Save) is disabled during its in-flight request, so double-clicks can fire duplicate writes. All five `fetch` calls (`App.jsx:26-93`) throw hardcoded error strings and never read the actual response body.

**UX Issues** — No confirmation before delete (`App.jsx:168`), no success feedback after any mutation, `addTask` checks `.trim()` but sends the untrimmed value (`App.jsx:38,43`), `saveEdit` has no empty-title guard at all, no `<label>` elements, an unlabeled icon-only dismiss button (`App.jsx:105`), and the edit form is a plain `<div>` so Enter doesn't submit it.

**Top 3 suggested fixes**: (1) add a `loading` state so the empty-state message is trustworthy; (2) require `window.confirm` before delete; (3) disable the Add button and trim input during submission.

## Cross-Cutting Issues

1. **Backend error detail is produced but never read.** FastAPI's `HTTPException(status_code=404, detail="Task not found")` (`main.py:53,71,84`) and 422 validation errors both return a structured JSON body with a `detail` field — but every frontend `catch` block (`App.jsx:29,45,57,67,87`) throws a hardcoded string and never calls `res.json()` on a failed response. A user who tries to delete an already-deleted task, or hits a 422 for an invalid field, sees the same generic "Could not delete task" message instead of the specific reason the backend already computed and sent. **Fix once, benefits both layers**: have the frontend's failure branches do `const body = await res.json().catch(() => null); throw new Error(body?.detail || 'Request failed')`.

2. **No input validation on either layer for edits.** The backend accepts blank titles (`schemas.py:12,18` — no `min_length`) and the frontend's `saveEdit` (`App.jsx:80-93`) has no empty-title guard the way `addTask` does. A user can clear a task's title in edit mode, hit Save, and end up with a permanently blank-titled task — nothing on either side stops it. This should be fixed on the backend (schema validation, since that's the actual trust boundary) and mirrored on the frontend for immediate feedback.

3. **The `exclude_unset` null bug is invisible to users because the frontend swallows the 500.** If any future frontend change (or a non-browser client) ever sends an explicit `null` for `completed`/`title`, the backend's unhandled 500 (see Backend Findings) would reach the user as the same generic hardcoded string as any other failure — there's no way to tell "the server crashed" apart from "task not found" apart from "network down." Fixing #1 (surface `detail`) won't fully help here since a raw 500 has no useful `detail` either — this one needs the backend-side try/except fix as the real cure.

4. **Backend already returns the full updated resource; frontend throws it away.** `create_task`/`update_task`/`toggle_complete` (`main.py:44,61,89`) all return the complete `TaskResponse` for the affected row, but `App.jsx` ignores that response and calls `fetchTasks()` again after every mutation (`App.jsx` — see `addTask`, `toggleComplete`, `saveEdit`). This isn't a bug, but it's a real, free optimization sitting unused on both sides of the API boundary.

## Top Priorities

1. **Fix `PUT /tasks/{id}`'s `exclude_unset` null-handling + add try/except/rollback around all commits** (backend, `main.py:57` + all mutating endpoints) — the only defect that can crash a legitimate-looking request.
2. **Make the frontend read and display the backend's actual `detail` message** instead of hardcoded strings (frontend, `App.jsx:29,45,57,67,87`) — directly improves every existing error path with no backend change required.
3. **Add title validation on the backend schema** (`schemas.py:12,18`, `min_length=1` + trim) and mirror it in `saveEdit` on the frontend — closes the one gap present on both sides simultaneously.
4. **Disable in-flight buttons and confirm before delete** (frontend, `App.jsx:121,161,168`) — cheap fixes that remove duplicate-write and accidental-delete risk.
5. **Use mutation responses instead of re-fetching** (frontend, `addTask`/`toggleComplete`/`saveEdit`) — removes an unnecessary round trip on every write now that the backend response is confirmed to already carry the full updated task.
