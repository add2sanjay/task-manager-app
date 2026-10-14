import { useState, useEffect } from 'react'
import ThemeSwitcher from './features/theme/ThemeSwitcher'

// Base URL for all API calls — change this if you move the backend
const API = 'http://localhost:8000'

export default function App() {
  // tasks: array of task objects from the backend
  const [tasks, setTasks] = useState([])
  // Fields for the "add task" form at the top
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  // editingId tracks which task (if any) is currently being edited inline
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  // error holds a message to show if any API call fails
  const [error, setError] = useState(null)

  // useEffect with [] runs once after the first render — ideal for initial data fetch
  useEffect(() => {
    fetchTasks()
  }, [])

  // --- API helpers ---

  async function fetchTasks() {
    try {
      const res = await fetch(`${API}/tasks`)
      if (!res.ok) throw new Error('Could not load tasks')
      setTasks(await res.json())
    } catch (e) {
      setError(e.message)
    }
  }

  async function addTask(e) {
    e.preventDefault()  // prevent the browser from reloading the page
    if (!newTitle.trim()) return
    try {
      const res = await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDesc || null }),
      })
      if (!res.ok) throw new Error('Could not create task')
      setNewTitle('')
      setNewDesc('')
      fetchTasks()  // refresh the list so the new task appears
    } catch (e) {
      setError(e.message)
    }
  }

  async function toggleComplete(id) {
    try {
      const res = await fetch(`${API}/tasks/${id}/complete`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Could not update task')
      fetchTasks()
    } catch (e) {
      setError(e.message)
    }
  }

  async function deleteTask(id) {
    try {
      const res = await fetch(`${API}/tasks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Could not delete task')
      fetchTasks()
    } catch (e) {
      setError(e.message)
    }
  }

  function startEdit(task) {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDesc(task.description || '')
  }

  async function saveEdit(id) {
    try {
      const res = await fetch(`${API}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, description: editDesc || null }),
      })
      if (!res.ok) throw new Error('Could not save changes')
      setEditingId(null)
      fetchTasks()
    } catch (e) {
      setError(e.message)
    }
  }

  // --- Render ---

  return (
    <div className="container">
      <header className="header">
        <h1>Task Manager</h1>
        <ThemeSwitcher />
      </header>

      {/* Error banner — only shown when error is non-null */}
      {error && (
        <div className="error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Add Task form */}
      <form onSubmit={addTask} className="add-form">
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Task title (required)"
        />
        <input
          value={newDesc}
          onChange={e => setNewDesc(e.target.value)}
          placeholder="Description (optional)"
        />
        <button type="submit">Add Task</button>
      </form>

      {/* Task list */}
      <ul className="task-list">
        {tasks.length === 0 && (
          <li className="empty">No tasks yet — add one above!</li>
        )}

        {tasks.map(task => (
          <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>

            {editingId === task.id ? (
              /* ── Edit mode ── */
              <div className="edit-form">
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="Title"
                />
                <input
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Description"
                />
                <div className="task-actions">
                  <button onClick={() => saveEdit(task.id)} className="btn-save">Save</button>
                  <button onClick={() => setEditingId(null)} className="btn-cancel">Cancel</button>
                </div>
              </div>
            ) : (
              /* ── View mode ── */
              <>
                <div className="task-content">
                  <span className="task-title">{task.title}</span>
                  {task.description && (
                    <span className="task-desc">{task.description}</span>
                  )}
                </div>
                <div className="task-actions">
                  <button
                    onClick={() => toggleComplete(task.id)}
                    className={task.completed ? 'btn-undo' : 'btn-complete'}
                  >
                    {task.completed ? 'Undo' : 'Complete'}
                  </button>
                  <button onClick={() => startEdit(task)} className="btn-edit">Edit</button>
                  <button onClick={() => deleteTask(task.id)} className="btn-delete">Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
