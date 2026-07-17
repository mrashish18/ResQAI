"""
SOS report routes for ResQAI.
Citizens submit emergency SOS reports; responders update their status.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from auth import get_current_active_user, require_roles
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/sos", tags=["SOS Reports"])

VALID_STATUSES = ["pending", "acknowledged", "in_progress", "resolved", "cancelled"]

_RESPONDER_ROLES = (
    models.UserRole.admin,
    models.UserRole.rescue_team,
    models.UserRole.government,
)


# ---------------------------------------------------------------------------
# Submit SOS (any authenticated user)
# ---------------------------------------------------------------------------

@router.post(
    "/",
    response_model=schemas.SOSResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit an emergency SOS report",
)
def submit_sos(
    sos_in: schemas.SOSCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Submit an emergency SOS report.

    The report is linked to the authenticated user and begins with status='pending'.
    Use the `image_url` field to attach the URL of a previously uploaded image
    (via POST /api/uploads/image).
    """
    sos = models.SOSReport(
        **sos_in.model_dump(),
        user_id=current_user.id,
        status="pending",
    )
    db.add(sos)
    db.commit()
    db.refresh(sos)
    return sos


# ---------------------------------------------------------------------------
# List SOS reports
# ---------------------------------------------------------------------------

@router.get("/", response_model=List[schemas.SOSResponse], summary="List SOS reports")
def list_sos(
    sos_status: Optional[str] = Query(None, alias="status", description="Filter by status"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    medical_only: bool = Query(False, description="Return only medical emergencies"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    List SOS reports.
    - Admins / rescue teams / government see all reports.
    - Citizens see only their own reports.
    """
    query = db.query(models.SOSReport)

    if current_user.role not in _RESPONDER_ROLES:
        query = query.filter(models.SOSReport.user_id == current_user.id)

    if sos_status:
        query = query.filter(models.SOSReport.status == sos_status)

    if severity:
        query = query.filter(models.SOSReport.severity == severity)

    if medical_only:
        query = query.filter(models.SOSReport.medical_emergency == True)  # noqa: E712

    return (
        query.order_by(models.SOSReport.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ---------------------------------------------------------------------------
# Get single SOS report
# ---------------------------------------------------------------------------

@router.get("/{sos_id}", response_model=schemas.SOSResponse)
def get_sos(
    sos_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Retrieve a specific SOS report by ID."""
    sos = db.query(models.SOSReport).filter(models.SOSReport.id == sos_id).first()
    if not sos:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SOS report not found.")

    # Citizens can only see their own reports
    if current_user.role not in _RESPONDER_ROLES and sos.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    return sos


# ---------------------------------------------------------------------------
# Update SOS status (responders only)
# ---------------------------------------------------------------------------

@router.put("/{sos_id}/status", response_model=schemas.SOSResponse)
def update_sos_status(
    sos_id: int,
    payload: schemas.SOSStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(*_RESPONDER_ROLES)),
):
    """
    Update the status of an SOS report.
    Rescue team, government, or admin role required.

    Valid statuses: pending | acknowledged | in_progress | resolved | cancelled
    """
    if payload.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status. Choose from: {VALID_STATUSES}",
        )

    sos = db.query(models.SOSReport).filter(models.SOSReport.id == sos_id).first()
    if not sos:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SOS report not found.")

    sos.status = payload.status
    db.commit()
    db.refresh(sos)
    return sos


# ---------------------------------------------------------------------------
# Delete SOS report (admin only)
# ---------------------------------------------------------------------------

@router.delete("/{sos_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sos(
    sos_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(models.UserRole.admin)),
):
    """Delete an SOS report. Admin access required."""
    sos = db.query(models.SOSReport).filter(models.SOSReport.id == sos_id).first()
    if not sos:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SOS report not found.")

    db.delete(sos)
    db.commit()
