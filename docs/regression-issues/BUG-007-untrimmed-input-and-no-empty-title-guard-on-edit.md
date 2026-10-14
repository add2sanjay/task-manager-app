# BUG-007: `addTask` sends untrimmed input despite its own trim check, and `saveEdit` has no empty-title guard at all

**Severity:** Low
**Component:** Frontend
**Affected files:** `frontend/src/App.jsx:38` (guard), `:43` (payload), `:80-93` (`saveEdit`)

## Description

Two related input-hygiene gaps:

1. **`addTask` checks `.trim()` but sends the untrimmed value.** The guard at `App.jsx:38` is `if (!newTitle.trim()) return`, but the actual request body built at `App.jsx:43` sends `newTitle` (and `newDesc`) as-is, not the trimmed version. A title of `"  My task  "` passes the guard and is persisted with its leading/trailing whitespace intact.
2. **`saveEdit` has no empty-title guard at all.** Unlike `addTask`, `saveEdit` (`App.jsx:80-93`) never checks that `editTitle` is non-empty before sending the `PUT` request. A user can clear a task's title in edit mode and click Save, sending `{"title": ""}` with no client-side pushback (this pairs with BUG-003 on the backend — currently nothing on either layer stops it).

## Failure Scenario

1. Add a new task with title `"  Buy milk  "` — it's created and displayed with visible leading/trailing whitespace, and any future exact-match search/filter on title would fail to match the "clean" string.
2. Edit an existing task, clear the title field entirely, and click Save — the task's title becomes an empty string with no warning, no confirmation, and no error shown.

## Expected vs Actual

- **Expected:** submitted titles/descriptions are trimmed before being sent, and clearing a title in edit mode is blocked client-side the same way it is on create.
- **Actual:** `addTask` trims only for the purpose of the guard check, not the actual payload, and `saveEdit` has no equivalent guard at all.

## Suggested Fix

```js
// addTask (App.jsx:36-52) — send the trimmed values, not the raw state
async function addTask(e) {
  e.preventDefault()
  if (!newTitle.trim()) return
  const res = await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: newTitle.trim(), description: newDesc.trim() || null }),
  })
  // ...
}

// saveEdit (App.jsx:80-93) — add the same guard addTask already has
async function saveEdit(id) {
  if (!editTitle.trim()) {
    setError('Title cannot be empty')
    return
  }
  const res = await fetch(`${API}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: editTitle.trim(), description: editDesc.trim() || null }),
  })
  // ...
}
```

## Acceptance Criteria

- Submitting `"  Buy milk  "` via the Add form persists `"Buy milk"` (trimmed), not the raw string with whitespace.
- Clearing a task's title in edit mode and clicking Save shows a client-side error and does not send the request, matching the behavior `addTask` already has for blank titles.
