"""
File upload routes for ResQAI.
Provides endpoints for uploading images (SOS evidence, profile photos, etc.).
Files are saved to the local uploads/ directory and served as static files.
"""

import os
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from auth import get_current_active_user
from config import get_settings
from utils import save_upload_file
import models

settings = get_settings()
router = APIRouter(prefix="/api/uploads", tags=["File Uploads"])


@router.post(
    "/image",
    summary="Upload an image file",
    status_code=status.HTTP_201_CREATED,
)
async def upload_image(
    file: UploadFile = File(..., description="Image file to upload (JPEG, PNG, WebP, GIF)"),
    folder: Optional[str] = "general",
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Upload an image and receive back a URL path.

    - Accepts: JPEG, PNG, WebP, GIF
    - Max size: configurable via MAX_UPLOAD_SIZE_MB env var (default 10 MB)
    - Returns: relative URL to access the file via /uploads/...

    The returned `url` can be stored in any model field that holds an image URL
    (e.g. SOSReport.image_url).
    """
    # Sanitise folder name to prevent directory traversal
    safe_folder = "".join(c for c in (folder or "general") if c.isalnum() or c in "-_")[:32] or "general"

    url = await save_upload_file(file, subfolder=safe_folder)

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "url": f"/{url}",
            "filename": Path(url).name,
            "folder": safe_folder,
            "uploaded_by": current_user.email,
        },
    )


@router.delete(
    "/image",
    summary="Delete an uploaded image",
    status_code=status.HTTP_200_OK,
)
def delete_image(
    file_path: str,
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Delete a previously uploaded image file.

    - Admins can delete any file.
    - Other users can only delete their own uploads (by knowing the path).
    - The path should be the relative path returned from the upload endpoint
      (e.g. `uploads/sos/abc123.jpg`).
    """
    # Strip leading slash
    clean_path = file_path.lstrip("/")

    # Security: path must start with the uploads directory name
    if not clean_path.startswith(settings.upload_dir):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file path. Only files inside the uploads directory can be deleted.",
        )

    # Prevent directory traversal
    abs_path = os.path.abspath(clean_path)
    abs_upload_dir = os.path.abspath(settings.upload_dir)
    if not abs_path.startswith(abs_upload_dir):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file path.",
        )

    if not os.path.isfile(abs_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found.",
        )

    try:
        os.remove(abs_path)
    except OSError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file: {exc}",
        )

    return {"message": "File deleted successfully.", "path": clean_path}
