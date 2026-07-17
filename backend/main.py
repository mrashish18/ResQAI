"""
ResQAI FastAPI Backend — Main Application Entry Point.

Disaster Intelligence & Response Platform for India.
"""

import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from config import get_settings
from database import Base, engine, SessionLocal
from utils import ensure_upload_dir
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
from routes.uploads import router as uploads_router
from routes.volunteers import router as volunteers_router

settings = get_settings()

# ---------------------------------------------------------------------------
# Logging configuration
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.DEBUG if not settings.is_production else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("resqai")


# ---------------------------------------------------------------------------
# Lifespan context manager
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    - On startup: create all DB tables, seed initial data, ensure upload dir.
    - On shutdown: log shutdown message.
    """
    # ---- STARTUP ----
    logger.info("ResQAI Backend starting up (env=%s)…", settings.environment)

    # Create all database tables (idempotent — safe to run every time)
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created / verified.")

    # Ensure uploads directory exists
    ensure_upload_dir()
    logger.info("Upload directory ready at '%s/'.", settings.upload_dir)

    # Seed database with initial data if empty
    from seed import seed_database
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as exc:
        logger.warning("Seed error (non-fatal): %s", exc)
    finally:
        db.close()

    logger.info("ResQAI API is ready to serve requests.")
    yield

    # ---- SHUTDOWN ----
    logger.info("ResQAI Backend shutting down.")


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------

app = FastAPI(
    title=settings.app_title,
    description=settings.app_description,
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# Request timing & logging middleware
# ---------------------------------------------------------------------------

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log every incoming request with method, path, status, and duration."""
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start) * 1000, 1)
    logger.info(
        "%s %s → %s  (%.1f ms)",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    # Attach timing header for frontend debugging
    response.headers["X-Process-Time-Ms"] = str(duration_ms)
    return response


# ---------------------------------------------------------------------------
# Global exception handler
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all handler so unhandled exceptions return clean JSON."""
    logger.error("Unhandled exception on %s %s: %s", request.method, request.url, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected internal server error occurred."},
    )


# ---------------------------------------------------------------------------
# CORS Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins if settings.is_production else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time-Ms"],
)


# ---------------------------------------------------------------------------
# Static files — serve uploaded media
# ---------------------------------------------------------------------------

# Mount uploads directory for serving images (SOS photos, etc.)
import os
uploads_path = os.path.abspath(settings.upload_dir)
os.makedirs(uploads_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")


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
app.include_router(uploads_router)
app.include_router(volunteers_router)


# ---------------------------------------------------------------------------
# Root & Health endpoints
# ---------------------------------------------------------------------------

@app.get("/", tags=["Root"])
def root():
    """Root endpoint — API welcome message."""
    return {
        "message": "Welcome to ResQAI — Disaster Intelligence & Response Platform",
        "version": settings.app_version,
        "docs": "/docs",
        "redoc": "/redoc",
        "status": "operational",
        "environment": settings.environment,
        "platform": "India Disaster Management System",
    }


@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint.
    Returns HTTP 200 with status information when the service is healthy.
    Used by load balancers, container orchestrators, and monitoring tools.
    """
    from sqlalchemy import text

    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "connected"
    except Exception as exc:
        db_status = f"error: {str(exc)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "service": "ResQAI Backend API",
        "version": settings.app_version,
        "environment": settings.environment,
    }
