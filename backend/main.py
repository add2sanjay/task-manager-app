from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, get_db

# Create database tables based on our models if they don't exist yet.
# In production you'd use Alembic migrations instead, but this is fine for learning.
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Manager API", version="1.0.0")

# CORS (Cross-Origin Resource Sharing): browsers block JS from calling APIs
# on a different origin (protocol + domain + port) by default. This middleware
# tells the browser our API explicitly allows requests from the React dev server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],   # GET, POST, PUT, DELETE, PATCH, OPTIONS
    allow_headers=["*"],
)


# --- GET /tasks ---
@app.get("/tasks", response_model=List[schemas.TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    """Return all tasks, newest first."""
    return db.query(models.Task).order_by(models.Task.created_at.desc()).all()


# --- POST /tasks ---
@app.post("/tasks", response_model=schemas.TaskResponse, status_code=201)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    """Create a new task. Returns the created task with its generated id."""
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    # refresh() reloads the object from the DB so we get the auto-generated
    # id and created_at values set by the database
    db.refresh(db_task)
    return db_task


# --- PUT /tasks/{id} ---
@app.put("/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task(task_id: int, task: schemas.TaskUpdate, db: Session = Depends(get_db)):
    """Update title, description, or completed on an existing task."""
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    # exclude_unset=True means fields the client didn't send are skipped,
    # so a PUT with just {"title": "foo"} won't accidentally clear description
    for field, value in task.model_dump(exclude_unset=True).items():
        setattr(db_task, field, value)

    db.commit()
    db.refresh(db_task)
    return db_task


# --- DELETE /tasks/{id} ---
@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task. Returns 204 No Content on success."""
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(db_task)
    db.commit()
    # 204 responses must have no body — FastAPI handles this automatically


# --- PATCH /tasks/{id}/complete ---
@app.patch("/tasks/{task_id}/complete", response_model=schemas.TaskResponse)
def toggle_complete(task_id: int, db: Session = Depends(get_db)):
    """Toggle the completed status of a task (true → false, false → true)."""
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db_task.completed = not db_task.completed
    db.commit()
    db.refresh(db_task)
    return db_task
