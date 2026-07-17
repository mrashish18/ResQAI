"""
Rescue team management routes for ResQAI.
Handles listing teams, updating their status, and assigning them to incidents.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/rescue", tags=["Rescue Teams"])


@router.get("/teams", response_model=List[schemas.RescueTeamResponse])
def list_teams(
    team_status: str = Query(None, alias="status", description="Filter by team status"),
    db: Session = Depends(get_db),
):
    """List all rescue teams, optionally filtered by status. Publicly accessible."""
    query = db.query(models.RescueTeam)

    if team_status:
        valid_statuses = [s.value for s in models.RescueTeamStatus]
        if team_status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid status. Choose from: {valid_statuses}",
            )
        query = query.filter(models.RescueTeam.status == team_status)

    teams = query.order_by(models.RescueTeam.name).all()
    return teams


@router.put("/teams/{team_id}/status", response_model=schemas.RescueTeamResponse)
def update_team_status(
    team_id: int,
    new_status: str = Query(..., description="New team status: available | deployed | returning"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Update a rescue team's operational status. Admin or rescue team role required."""
    allowed_roles = {
        models.UserRole.admin,
        models.UserRole.rescue_team,
        models.UserRole.government,
    }
    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges to update rescue team status.",
        )

    valid_statuses = [s.value for s in models.RescueTeamStatus]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status. Choose from: {valid_statuses}",
        )

    team = db.query(models.RescueTeam).filter(models.RescueTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rescue team not found.")

    team.status = new_status
    # If team moves to available, clear assignment
    if new_status == models.RescueTeamStatus.available.value:
        team.assigned_incident_id = None

    db.commit()
    db.refresh(team)
    return team


@router.put("/teams/{team_id}/assign", response_model=schemas.RescueTeamResponse)
def assign_team_to_incident(
    team_id: int,
    incident_id: int = Query(..., description="ID of the incident to assign the team to"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Assign a rescue team to a specific incident. Admin or government required."""
    allowed_roles = {models.UserRole.admin, models.UserRole.government}
    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or government role required to assign rescue teams.",
        )

    team = db.query(models.RescueTeam).filter(models.RescueTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rescue team not found.")

    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

    if team.status == models.RescueTeamStatus.deployed and team.assigned_incident_id != incident_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Team '{team.name}' is already deployed to incident #{team.assigned_incident_id}. "
                "Update their status to 'returning' or 'available' first."
            ),
        )

    team.assigned_incident_id = incident_id
    team.status = models.RescueTeamStatus.deployed

    db.commit()
    db.refresh(team)
    return team
