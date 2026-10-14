from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.models import task as task_model  # noqa: F401 — registers the model on Base
from app.api.routes.tasks import router as tasks_router

# Create database tables based on our models if they don't exist yet.
# In production you'd use Alembic migrations instead, but this is fine for learning.
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

# CORS (Cross-Origin Resource Sharing): browsers block JS from calling APIs
# on a different origin (protocol + domain + port) by default. This middleware
# tells the browser our API explicitly allows requests from the React dev server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],   # GET, POST, PUT, DELETE, PATCH, OPTIONS
    allow_headers=["*"],
)

app.include_router(tasks_router)
