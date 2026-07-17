"""
Shared utility helpers for ResQAI backend.
"""

import os
import uuid
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, UploadFile, status

from config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Allowed MIME types for image uploads
ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
}


def ensure_upload_dir() -> Path:
    """
    Create the uploads directory if it does not exist and return its Path.
    """
    upload_path = Path(settings.upload_dir)
    upload_path.mkdir(parents=True, exist_ok=True)
    return upload_path


async def save_upload_file(
    file: UploadFile,
    subfolder: str = "images",
    allowed_types: Optional[set] = None,
) -> str:
    """
    Validate and save an uploaded file.

    Args:
        file: The FastAPI UploadFile object.
        subfolder: Sub-directory within the uploads folder (e.g. "sos").
        allowed_types: Set of allowed MIME types. Defaults to images only.

    Returns:
        Relative URL path to the saved file (e.g. "uploads/sos/abc123.jpg").

    Raises:
        HTTPException 400 for invalid type or oversized files.
        HTTPException 500 for I/O errors.
    """
    if allowed_types is None:
        allowed_types = ALLOWED_IMAGE_TYPES

    # Validate content type
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file type '{file.content_type}'. "
                f"Allowed: {sorted(allowed_types)}"
            ),
        )

    # Read file content and check size
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    content = await file.read()
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"File too large. Maximum size is {settings.max_upload_size_mb} MB."
            ),
        )

    # Build a unique filename preserving extension
    ext = Path(file.filename or "upload").suffix.lower() or ".jpg"
    unique_name = f"{uuid.uuid4().hex}{ext}"

    # Ensure directory exists
    dest_dir = ensure_upload_dir() / subfolder
    dest_dir.mkdir(parents=True, exist_ok=True)

    dest_path = dest_dir / unique_name
    try:
        dest_path.write_bytes(content)
    except OSError as exc:
        logger.error("Failed to write uploaded file: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save uploaded file. Please try again.",
        )

    return f"{settings.upload_dir}/{subfolder}/{unique_name}"


def paginate(query, skip: int = 0, limit: int = 100):
    """
    Apply offset/limit pagination to a SQLAlchemy query.

    Args:
        query: A SQLAlchemy Query object.
        skip: Number of records to skip.
        limit: Maximum records to return.

    Returns:
        List of ORM objects.
    """
    return query.offset(skip).limit(limit).all()


def utc_now() -> datetime:
    """Return the current UTC timestamp."""
    return datetime.utcnow()
