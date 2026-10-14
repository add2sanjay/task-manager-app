import TaskItem from './TaskItem'

export default function TaskList({
  tasks,
  editingId,
  editTitle,
  setEditTitle,
  editDesc,
  setEditDesc,
  onSaveEdit,
  onCancelEdit,
  onToggleComplete,
  onStartEdit,
  onDelete,
}) {
  return (
    <ul className="task-list">
      {tasks.length === 0 && (
        <li className="empty">No tasks yet — add one above!</li>
      )}

      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          isEditing={editingId === task.id}
          editTitle={editTitle}
          setEditTitle={setEditTitle}
          editDesc={editDesc}
          setEditDesc={setEditDesc}
          onSave={() => onSaveEdit(task.id)}
          onCancel={onCancelEdit}
          onToggleComplete={() => onToggleComplete(task.id)}
          onEdit={() => onStartEdit(task)}
          onDelete={() => onDelete(task.id)}
        />
      ))}
    </ul>
  )
}
