"""
Incident management routes for ResQAI.
Supports CRUD operations with optional filters for type, severity, and status.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])


@router.get("/", response_model=List[schemas.IncidentResponse])
def list_incidents(
    type: Optional[str] = Query(None, description="Filter by incident type"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    incident_status: Optional[str] = Query(None, alias="status", description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """
    List all incidents with optional filters.
    No authentication required for public visibility.
    """
    query = db.query(models.Incident)

    if type:
        query = query.filter(models.Incident.type == type)
    if severity:
        query = query.filter(models.Incident.severity == severity)
    if incident_status:
        query = query.filter(models.Incident.status == incident_status)

    incidents = (
        query.order_by(models.Incident.created_at.desc()).offset(skip).limit(limit).all()
    )
    return incidents


@router.post("/", response_model=schemas.IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(
    incident_in: schemas.IncidentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Create a new disaster incident report."""

    # Validate enums
    valid_types = [t.value for t in models.IncidentType]
    valid_severities = [s.value for s in models.SeverityLevel]
    valid_statuses = [s.value for s in models.IncidentStatus]

    if incident_in.type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid incident type. Choose from: {valid_types}",
        )
    if incident_in.severity not in valid_severities:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid severity. Choose from: {valid_severities}",
        )

    incident = models.Incident(
        **incident_in.model_dump(),
        reporter_id=current_user.id,
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("/{incident_id}", response_model=schemas.IncidentResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific incident by its ID."""
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")
    return incident


@router.put("/{incident_id}", response_model=schemas.IncidentResponse)
def update_incident(
    incident_id: int,
    update: schemas.IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Update an incident record.
    Reporter or admin can update. Non-admins can only update their own incidents.
    """
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

    if (
        current_user.role != models.UserRole.admin
        and incident.reporter_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update incidents you reported.",
        )

    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(incident, field, value)

    db.commit()
    db.refresh(incident)
    return incident


@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Delete an incident. Admin access required."""
    if current_user.role != models.UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required to delete incidents.",
        )

    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

    db.delete(incident)
    db.commit()
