import { useState, useEffect } from 'react'
import {
  fetchTasks,
  createTask,
  updateTask,
  toggleTaskComplete,
  deleteTask as deleteTaskRequest,
} from '../api/tasksApi'

// Owns all task state and mutations. Components stay presentational and
// just receive this hook's values/handlers as props via TasksPage.
export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [error, setError] = useState(null)

  // useEffect with [] runs once after the first render — ideal for initial data fetch
  useEffect(() => {
    loadTasks()
  }, [])

  async function loadTasks() {
    try {
      setTasks(await fetchTasks())
    } catch (e) {
      setError(e.message)
    }
  }

  async function addTask(e) {
    e.preventDefault()  // prevent the browser from reloading the page
    if (!newTitle.trim()) return
    try {
      await createTask({ title: newTitle, description: newDesc })
      setNewTitle('')
      setNewDesc('')
      loadTasks()  // refresh the list so the new task appears
    } catch (e) {
      setError(e.message)
    }
  }

  async function toggleComplete(id) {
    try {
      await toggleTaskComplete(id)
      loadTasks()
    } catch (e) {
      setError(e.message)
    }
  }

  async function deleteTask(id) {
    try {
      await deleteTaskRequest(id)
      loadTasks()
    } catch (e) {
      setError(e.message)
    }
  }

  function startEdit(task) {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDesc(task.description || '')
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(id) {
    try {
      await updateTask(id, { title: editTitle, description: editDesc })
      setEditingId(null)
      loadTasks()
    } catch (e) {
      setError(e.message)
    }
  }

  return {
    tasks,
    error,
    setError,
    newTitle,
    setNewTitle,
    newDesc,
    setNewDesc,
    editingId,
    editTitle,
    setEditTitle,
    editDesc,
    setEditDesc,
    addTask,
    toggleComplete,
    deleteTask,
    startEdit,
    cancelEdit,
    saveEdit,
  }
}
