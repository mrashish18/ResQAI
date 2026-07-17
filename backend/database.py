"""
Database configuration for ResQAI.
Engine creation is controlled via config.py settings.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from config import get_settings

settings = get_settings()

# Create SQLAlchemy engine.
# SQLite needs check_same_thread=False; PostgreSQL does not.
if settings.is_sqlite:
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
        echo=settings.environment == "development",
    )
else:
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,   # Detect stale connections before use
        pool_size=10,         # Connection pool size
        max_overflow=20,      # Extra connections beyond pool_size
        echo=False,
    )

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()

# Re-export DATABASE_URL so alembic/env.py can import it
DATABASE_URL = settings.database_url


def get_db():
    """
    FastAPI dependency: yields a database session and ensures it is
    properly closed after the request, even on errors.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
