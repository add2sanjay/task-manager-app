import { API_BASE_URL } from '../../../api/client'

export async function fetchTasks() {
  const res = await fetch(`${API_BASE_URL}/tasks`)
  if (!res.ok) throw new Error('Could not load tasks')
  return res.json()
}

export async function createTask({ title, description }) {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description: description || null }),
  })
  if (!res.ok) throw new Error('Could not create task')
  return res.json()
}

export async function updateTask(id, { title, description }) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description: description || null }),
  })
  if (!res.ok) throw new Error('Could not save changes')
  return res.json()
}

export async function toggleTaskComplete(id) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}/complete`, { method: 'PATCH' })
  if (!res.ok) throw new Error('Could not update task')
  return res.json()
}

export async function deleteTask(id) {
  const res = await fetch(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Could not delete task')
}
