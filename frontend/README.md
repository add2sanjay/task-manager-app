# Task Manager — Frontend

A React + Vite app for learning modern frontend development.

## Tech choices explained

| Tool | Why |
|---|---|
| **Vite** | Much faster dev server than Create React App; uses native ES modules in the browser |
| **React 18** | Industry-standard UI library; `useState` + `useEffect` cover most of what you need to learn |
| No UI library | Helps you learn CSS and understand what component libraries are abstracting |

## File structure

```
frontend/
├── index.html        # Entry point — Vite injects the compiled JS here
├── vite.config.js    # Vite config — sets port to 3000
├── package.json
└── src/
    ├── main.jsx      # Mounts the React app into index.html's <div id="root">
    ├── App.jsx       # All components and state live here (intentionally simple)
    └── App.css       # All styles
```

## Key React concepts used in App.jsx

- **`useState`** — stores data that changes over time (task list, form inputs, edit state)
- **`useEffect(() => fn, [])`** — the `[]` means "run once on mount", used for initial fetch
- **Conditional rendering** — `{condition && <Component />}` shows/hides parts of the UI
- **List rendering** — `{tasks.map(task => <li key={task.id}>...)}` — always use a stable `key`

## Setup & run

```bash
# Install dependencies (creates node_modules/)
npm install

# Start the dev server on http://localhost:3000
npm run dev
```

Vite's dev server has **Hot Module Replacement (HMR)** — the browser updates instantly when you
save a file, without a full reload.

## Concepts to explore next

- **Custom hooks** — extract fetch logic into a `useTasks()` hook
- **React Query / SWR** — libraries that handle loading/error/caching state for you
- **React Router** — add a detail page at `/tasks/:id`
- **TypeScript** — add types to catch mistakes at compile time instead of runtime
