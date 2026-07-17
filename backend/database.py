"""
Database configuration for ResQAI.
Uses SQLite for development with SQLAlchemy ORM.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

import os

# SQLite database URL fallback
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./resqai.db")

# Create SQLAlchemy engine
# check_same_thread=False is only needed for SQLite
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False,
    )
else:
    engine = create_engine(
        DATABASE_URL,
        echo=False,
    )

# Create a configured SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()


def get_db():
    """
    Dependency function that provides a database session.
    Yields a session and ensures it is closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
