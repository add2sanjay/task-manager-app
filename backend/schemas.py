from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Pydantic schemas define the shape of data coming IN (request bodies)
# and going OUT (responses). They are separate from SQLAlchemy models on purpose:
# your database model and your API contract can evolve independently.


class TaskCreate(BaseModel):
    """Data required to create a new task."""
    title: str
    description: Optional[str] = None


class TaskUpdate(BaseModel):
    """All fields optional so the client can update just what changed."""
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None


class TaskResponse(BaseModel):
    """Shape of a task returned by the API."""
    id: int
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime

    class Config:
        # Tells Pydantic to read data from SQLAlchemy model attributes,
        # not just plain dicts — required when returning ORM objects directly
        from_attributes = True
