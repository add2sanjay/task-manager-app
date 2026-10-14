export default function TaskForm({ newTitle, setNewTitle, newDesc, setNewDesc, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="add-form">
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
  )
}
