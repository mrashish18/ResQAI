"""
ResQAI FastAPI Backend — Main Application Entry Point.

Disaster Intelligence & Response Platform for India.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine, SessionLocal
import models  # noqa: F401 — registers all ORM models with Base

# Import all routers
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.incidents import router as incidents_router
from routes.sos import router as sos_router
from routes.shelters import router as shelters_router
from routes.resources import router as resources_router
from routes.rescue import router as rescue_router
from routes.notifications import router as notifications_router
from routes.weather import router as weather_router
from routes.predictions import router as predictions_router
from routes.chatbot import router as chatbot_router
from routes.analytics import router as analytics_router


# ---------------------------------------------------------------------------
# Lifespan context manager
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    - On startup: create all DB tables and seed initial data.
    - On shutdown: perform any necessary cleanup.
    """
    # --------------- STARTUP ---------------
    print("ResQAI Backend starting up...")

    # Create all database tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created (or already exist).")

    # Seed database with initial data if empty
    from seed import seed_database
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        print(f"Seed error (non-fatal): {e}")
    finally:
        db.close()

    print("ResQAI API is ready to serve requests.")

    yield  # Application runs here

    # --------------- SHUTDOWN ---------------
    print("ResQAI Backend shutting down...")


# ---------------------------------------------------------------------------
# Application instance
# ---------------------------------------------------------------------------

app = FastAPI(
    title="ResQAI API",
    description=(
        "ResQAI — Disaster Intelligence & Response Platform for India. "
        "Provides real-time incident tracking, SOS reporting, AI predictions, "
        "shelter management, resource allocation, and rescue team coordination."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# CORS Middleware — allow all origins for development
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Include all routers
# ---------------------------------------------------------------------------

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(incidents_router)
app.include_router(sos_router)
app.include_router(shelters_router)
app.include_router(resources_router)
app.include_router(rescue_router)
app.include_router(notifications_router)
app.include_router(weather_router)
app.include_router(predictions_router)
app.include_router(chatbot_router)
app.include_router(analytics_router)


# ---------------------------------------------------------------------------
# Root & Health endpoints
# ---------------------------------------------------------------------------

@app.get("/", tags=["Root"])
def root():
    """Root endpoint — API welcome message."""
    return {
        "message": "Welcome to ResQAI — Disaster Intelligence & Response Platform",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "status": "operational",
        "platform": "India Disaster Management System",
    }


@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint.
    Returns HTTP 200 with status information when the service is healthy.
    Used by load balancers, container orchestrators (k8s), and monitoring tools.
    """
    from sqlalchemy import text

    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "healthy",
        "database": db_status,
        "service": "ResQAI Backend API",
        "version": "1.0.0",
    }
