from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base


class Task(Base):
    # __tablename__ tells SQLAlchemy what to name the table in SQLite
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)       # optional field
    completed = Column(Boolean, default=False)
    # server_default=func.now() lets the database set the timestamp,
    # so we never have to pass it manually when creating a task
    created_at = Column(DateTime(timezone=True), server_default=func.now())
