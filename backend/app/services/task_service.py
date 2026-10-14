from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


def get_tasks(db: Session):
    """Return all tasks, newest first."""
    return db.query(Task).order_by(Task.created_at.desc()).all()


def create_task(db: Session, task: TaskCreate):
    """Create a new task. Returns the created task with its generated id."""
    db_task = Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    # refresh() reloads the object from the DB so we get the auto-generated
    # id and created_at values set by the database
    db.refresh(db_task)
    return db_task


def update_task(db: Session, task_id: int, task: TaskUpdate):
    """Update title, description, or completed on an existing task."""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    # exclude_unset=True means fields the client didn't send are skipped,
    # so a PUT with just {"title": "foo"} won't accidentally clear description
    for field, value in task.model_dump(exclude_unset=True).items():
        setattr(db_task, field, value)

    db.commit()
    db.refresh(db_task)
    return db_task


def delete_task(db: Session, task_id: int):
    """Delete a task."""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(db_task)
    db.commit()


def toggle_complete(db: Session, task_id: int):
    """Toggle the completed status of a task (true → false, false → true)."""
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db_task.completed = not db_task.completed
    db.commit()
    db.refresh(db_task)
    return db_task
