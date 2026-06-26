from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite stores the database in a local file called tasks.db
# The file is created automatically on first run
SQLALCHEMY_DATABASE_URL = "sqlite:///./tasks.db"

# check_same_thread=False is required for SQLite when used with FastAPI,
# because FastAPI handles requests concurrently across threads
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
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
