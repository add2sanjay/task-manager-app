export default function TaskItem({
  task,
  isEditing,
  editTitle,
  setEditTitle,
  editDesc,
  setEditDesc,
  onSave,
  onCancel,
  onToggleComplete,
  onEdit,
  onDelete,
}) {
  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      {isEditing ? (
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
            <button onClick={onSave} className="btn-save">Save</button>
            <button onClick={onCancel} className="btn-cancel">Cancel</button>
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
              onClick={onToggleComplete}
              className={task.completed ? 'btn-undo' : 'btn-complete'}
            >
              {task.completed ? 'Undo' : 'Complete'}
            </button>
            <button onClick={onEdit} className="btn-edit">Edit</button>
            <button onClick={onDelete} className="btn-delete">Delete</button>
          </div>
        </>
      )}
    </li>
  )
}
