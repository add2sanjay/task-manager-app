# BUG-006: No confirmation before delete, and no disabled state on any action button during in-flight requests

**Severity:** Medium
**Component:** Frontend
**Affected files:** `frontend/src/App.jsx:121` (Add button), `:161-166` (Toggle button), `:168` (Delete button), `:147` (Save button)

## Description

Two related gaps in the same handlers:

1. **No confirmation before delete.** The Delete button at `App.jsx:168` calls `deleteTask(task.id)` directly on click with no confirmation step. A single misclick permanently removes a task with no undo.
2. **No disabled/pending state on any button.** The Add (`:121`), Toggle (`:161-166`), Delete (`:168`), and Save (`:147`) buttons never get disabled while their corresponding request is in flight. A user double-clicking any of them fires duplicate requests (e.g. two `POST /tasks` for one intended task, or two `DELETE` calls for the same id, where the second fails server-side with a 404 that BUG-004 then reports as a generic error).

## Failure Scenario

1. **Delete:** user misclicks "Delete" on the wrong task row — the task is gone instantly, with no confirmation and no way to undo.
2. **Duplicate submit:** user double-clicks "Add Task" on a slow connection — two identical `POST /tasks` requests fire before the first response updates the UI, creating two duplicate tasks.
3. **Duplicate toggle/delete:** user double-clicks "Toggle" or "Delete" — a second request for the same task id is sent while the first is still in flight; the second one either double-toggles the state unexpectedly or 404s on an already-deleted row.

## Expected vs Actual

- **Expected:** destructive actions require confirmation, and buttons are disabled (or otherwise guarded) while their request is pending so a user can't fire the same mutation twice.
- **Actual:** delete is instant and irreversible, and every button remains clickable throughout its request's lifetime.

## Suggested Fix

```jsx
// Delete button (App.jsx:168) — add confirmation
<button
  onClick={() => {
    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      deleteTask(task.id)
    }
  }}
  className="btn-delete"
>
  Delete
</button>
```

```jsx
// Add button (App.jsx:121) — add a submitting flag and disable while pending
const [submitting, setSubmitting] = useState(false)

async function addTask(e) {
  e.preventDefault()
  if (!newTitle.trim()) return
  setSubmitting(true)
  try {
    // ...existing fetch logic...
  } finally {
    setSubmitting(false)
  }
}

<button type="submit" disabled={submitting}>
  {submitting ? 'Adding…' : 'Add Task'}
</button>
```

Apply the same per-row pending-flag pattern to the Toggle and Save buttons, keyed by task id so one row's in-flight request doesn't disable unrelated rows.

## Acceptance Criteria

- Clicking Delete opens a confirmation prompt; the task is only removed if the user confirms.
- Rapidly double-clicking Add, Toggle, Delete, or Save results in exactly one request per intended action, not two.
- Buttons visibly reflect a pending state (disabled and/or relabeled) while their request is in flight.
