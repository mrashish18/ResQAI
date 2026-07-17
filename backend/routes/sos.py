"""
SOS report routes for ResQAI.
Citizens submit emergency SOS reports; responders update their status.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/sos", tags=["SOS Reports"])

VALID_STATUSES = ["pending", "acknowledged", "in_progress", "resolved", "cancelled"]


@router.post("/", response_model=schemas.SOSResponse, status_code=status.HTTP_201_CREATED)
def submit_sos(
    sos_in: schemas.SOSCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Submit an emergency SOS report."""
    sos = models.SOSReport(
        **sos_in.model_dump(),
        user_id=current_user.id,
        status="pending",
    )
    db.add(sos)
    db.commit()
    db.refresh(sos)
    return sos


@router.get("/", response_model=List[schemas.SOSResponse])
def list_sos(
    sos_status: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    List SOS reports.
    - Admins/responders see all reports.
    - Citizens only see their own.
    """
    query = db.query(models.SOSReport)

    admin_roles = {
        models.UserRole.admin,
        models.UserRole.rescue_team,
        models.UserRole.government,
    }
    if current_user.role not in admin_roles:
        query = query.filter(models.SOSReport.user_id == current_user.id)

    if sos_status:
        query = query.filter(models.SOSReport.status == sos_status)

    reports = (
        query.order_by(models.SOSReport.created_at.desc()).offset(skip).limit(limit).all()
    )
    return reports


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

    admin_roles = {models.UserRole.admin, models.UserRole.rescue_team, models.UserRole.government}
    if current_user.role not in admin_roles and sos.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied.",
        )
    return sos


@router.put("/{sos_id}/status", response_model=schemas.SOSResponse)
def update_sos_status(
    sos_id: int,
    new_status: str = Query(..., description=f"New status. Options: {VALID_STATUSES}"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Update the status of an SOS report. Rescue team or admin required."""
    allowed_roles = {
        models.UserRole.admin,
        models.UserRole.rescue_team,
        models.UserRole.government,
    }
    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only rescue teams and admins can update SOS status.",
        )

    if new_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status. Choose from: {VALID_STATUSES}",
        )

    sos = db.query(models.SOSReport).filter(models.SOSReport.id == sos_id).first()
    if not sos:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SOS report not found.")

    sos.status = new_status
    db.commit()
    db.refresh(sos)
    return sos
