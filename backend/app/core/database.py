from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

# For the default sqlite URL, resolve the file relative to the backend/
# directory (not the process CWD) so `tasks.db` always lands in the same
# place regardless of where `uvicorn` is launched from.
_database_url = settings.DATABASE_URL
if _database_url.startswith("sqlite:///./"):
    backend_dir = Path(__file__).resolve().parent.parent.parent
    db_path = backend_dir / _database_url.removeprefix("sqlite:///./")
    _database_url = f"sqlite:///{db_path}"

# check_same_thread=False is required for SQLite when used with FastAPI,
# because FastAPI handles requests concurrently across threads
engine = create_engine(
    _database_url,
    connect_args={"check_same_thread": False}
)

# SessionLocal is a factory: each call creates a new database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is the parent class all our SQLAlchemy models will inherit from
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a database session per request.
    The 'yield' makes this a generator — code after yield runs as cleanup
    (closing the session) even if the request handler raises an exception.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
