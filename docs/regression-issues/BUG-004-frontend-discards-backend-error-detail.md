# BUG-004: Frontend discards the backend's actual error message and shows generic hardcoded strings

**Severity:** Medium
**Component:** Frontend
**Affected files:** `frontend/src/App.jsx:29`, `:45`, `:57`, `:67`, `:87`

## Description

Every network call in `App.jsx` (`fetchTasks`, `addTask`, `toggleComplete`, `deleteTask`, `saveEdit`) follows the same pattern:

```js
if (!res.ok) throw new Error('Could not create task')
```

None of these read the actual response body. FastAPI returns a structured JSON error body on failures — e.g. `{"detail": "Task not found"}` on a `404`, or a structured validation error array on a `422` — but the frontend never calls `res.json()` on the failure path, so that information is thrown away. All five failure paths funnel into the same single `error` state (`App.jsx:17`, rendered at `102-107`), so the user always sees one of five hardcoded strings regardless of what actually went wrong on the server.

## Failure Scenario

1. Delete a task, then quickly click "Delete" on it again before the list re-renders (or open two tabs and delete the same task from both).
2. The second `DELETE /tasks/{id}` hits a task that no longer exists, and the backend correctly returns `404` with `{"detail": "Task not found"}`.
3. The user sees the generic hardcoded message `"Could not delete task"` — not the more accurate "Task not found" (or, worse, if the backend returned a validation error detailing exactly which field was invalid, the user never sees it).

This also means BUG-001/BUG-002's `500` errors are indistinguishable from a normal `404` in the UI — every failure looks the same to the user.

## Expected vs Actual

- **Expected:** the frontend surfaces the backend's actual `detail` message when available, falling back to a generic message only if the body can't be parsed.
- **Actual:** the frontend always shows one fixed string per action, ignoring whatever the backend actually reported.

## Suggested Fix

Extract a shared helper and use it in all five call sites:

```js
async function extractErrorMessage(res, fallback) {
  try {
    const body = await res.json()
    return body?.detail ?? fallback
  } catch {
    return fallback
  }
}

// example usage in addTask (App.jsx:36-52)
if (!res.ok) {
  throw new Error(await extractErrorMessage(res, 'Could not create task'))
}
```

Apply the same replacement to the failure branches in `fetchTasks`, `toggleComplete`, `deleteTask`, and `saveEdit`.

## Acceptance Criteria

- A `404` from the backend (e.g. deleting an already-deleted task) shows the backend's actual `detail` text in the UI, not a generic hardcoded string.
- If the response body isn't valid JSON or has no `detail` field, the existing generic fallback message is still shown (no new crash).
- All five network call sites use the same shared error-extraction logic.
