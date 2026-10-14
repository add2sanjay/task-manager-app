import os

# Centralized, env-overridable settings. Defaults match the values that used
# to be hardcoded in main.py/database.py, so behavior is unchanged unless
# these env vars are actually set.


class Settings:
    APP_NAME: str = "Task Manager API"
    APP_VERSION: str = "1.0.0"

    # Comma-separated list of allowed CORS origins
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:3000"
    ).split(",")

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./tasks.db")


settings = Settings()
