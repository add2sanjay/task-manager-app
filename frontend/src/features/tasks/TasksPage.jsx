import { useTasks } from './hooks/useTasks'
import ErrorBanner from './components/ErrorBanner'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'

export default function TasksPage() {
  const {
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
  } = useTasks()

  return (
    <>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      <TaskForm
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        newDesc={newDesc}
        setNewDesc={setNewDesc}
        onSubmit={addTask}
      />

      <TaskList
        tasks={tasks}
        editingId={editingId}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editDesc={editDesc}
        setEditDesc={setEditDesc}
        onSaveEdit={saveEdit}
        onCancelEdit={cancelEdit}
        onToggleComplete={toggleComplete}
        onStartEdit={startEdit}
        onDelete={deleteTask}
      />
    </>
  )
}
