# BUG-005: No loading state — "No tasks yet" flashes before the initial fetch resolves

**Severity:** Low
**Component:** Frontend
**Affected files:** `frontend/src/App.jsx:8-17` (state), `:26-34` (`fetchTasks`), `:126-128` (render)

## Description

`App.jsx` declares 7 `useState` hooks (`App.jsx:8-17`) but none of them track whether the initial `GET /tasks` request is still in flight. The empty-state check:

```jsx
{tasks.length === 0 && (
  <li className="empty">No tasks yet — add one above!</li>
)}
```

at `App.jsx:126-128` is `true` both while `tasks` hasn't loaded yet (still `[]` from the initial `useState([])`) and once it's confirmed there really are zero tasks. There is no spinner, skeleton, or any other loading indicator anywhere in the component.

## Failure Scenario

1. Load the app on a slow connection, or with a backend that takes a moment to respond (e.g. cold start, or a large task list).
2. Between initial render and the `fetchTasks()` response resolving, the user sees "No tasks yet — add one above!" even though tasks actually exist and just haven't loaded.
3. A user who trusts that message may conclude their data was lost and try to re-add tasks that already exist.

## Expected vs Actual

- **Expected:** the UI shows a distinct "loading" state until the first fetch completes, and only shows "No tasks yet" once it's confirmed the list is actually empty.
- **Actual:** "loading" and "confirmed empty" are visually identical.

## Suggested Fix

```jsx
// App.jsx — add alongside the existing state declarations
const [loading, setLoading] = useState(true)

async function fetchTasks() {
  try {
    const res = await fetch(`${API}/tasks`)
    if (!res.ok) throw new Error('Could not load tasks')
    setTasks(await res.json())
  } catch (e) {
    setError(e.message)
  } finally {
    setLoading(false)
  }
}

// replacing the render at App.jsx:126-128
{loading ? (
  <li className="empty">Loading tasks…</li>
) : tasks.length === 0 ? (
  <li className="empty">No tasks yet — add one above!</li>
) : null}
```

## Acceptance Criteria

- On initial page load, a distinct "Loading tasks…" message is shown until the first `GET /tasks` response resolves.
- "No tasks yet — add one above!" is only shown after the fetch has completed and the list is confirmed empty.
- Behavior for a non-empty list is unchanged.
