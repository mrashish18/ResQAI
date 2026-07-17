"""
Rescue team management routes for ResQAI.
Handles listing, creating, updating team status, and assigning teams to incidents.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from auth import get_current_active_user, require_roles
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/rescue", tags=["Rescue Teams"])

_ADMIN_GOV = (models.UserRole.admin, models.UserRole.government)
_OPS_ROLES = (models.UserRole.admin, models.UserRole.government, models.UserRole.rescue_team)


# ---------------------------------------------------------------------------
# List teams
# ---------------------------------------------------------------------------

@router.get("/teams", response_model=List[schemas.RescueTeamResponse])
def list_teams(
    team_status: Optional[str] = Query(None, alias="status", description="Filter by team status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
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

    return query.order_by(models.RescueTeam.name).offset(skip).limit(limit).all()


# ---------------------------------------------------------------------------
# Create team (admin / government only)
# ---------------------------------------------------------------------------

@router.post(
    "/teams",
    response_model=schemas.RescueTeamResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new rescue team",
)
def create_team(
    team_in: schemas.RescueTeamCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(*_ADMIN_GOV)),
):
    """
    Register a new rescue team in the system.
    Requires admin or government role.
    """
    valid_statuses = [s.value for s in models.RescueTeamStatus]
    team_status = team_in.status if team_in.status in valid_statuses else "available"

    team = models.RescueTeam(
        name=team_in.name,
        status=team_status,
        latitude=team_in.latitude,
        longitude=team_in.longitude,
        members_count=team_in.members_count,
        specialization=team_in.specialization,
    )
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


# ---------------------------------------------------------------------------
# Get a single team
# ---------------------------------------------------------------------------

@router.get("/teams/{team_id}", response_model=schemas.RescueTeamResponse)
def get_team(team_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific rescue team by ID. Publicly accessible."""
    team = db.query(models.RescueTeam).filter(models.RescueTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rescue team not found.")
    return team


# ---------------------------------------------------------------------------
# Update team status
# ---------------------------------------------------------------------------

@router.put("/teams/{team_id}/status", response_model=schemas.RescueTeamResponse)
def update_team_status(
    team_id: int,
    new_status: str = Query(..., description="New team status: available | deployed | returning"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(*_OPS_ROLES)),
):
    """
    Update a rescue team's operational status.
    Admin, government, or rescue_team role required.
    Setting status back to 'available' will automatically clear the incident assignment.
    """
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
    # Clear assignment when team returns to available
    if new_status == models.RescueTeamStatus.available.value:
        team.assigned_incident_id = None

    db.commit()
    db.refresh(team)
    return team


# ---------------------------------------------------------------------------
# Assign team to incident
# ---------------------------------------------------------------------------

@router.put("/teams/{team_id}/assign", response_model=schemas.RescueTeamResponse)
def assign_team_to_incident(
    team_id: int,
    incident_id: int = Query(..., description="ID of the incident to assign the team to"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(*_ADMIN_GOV)),
):
    """
    Assign a rescue team to a specific incident.
    Admin or government role required.
    A team already deployed to a different incident will raise a 409 Conflict.
    """
    team = db.query(models.RescueTeam).filter(models.RescueTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rescue team not found.")

    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found.")

    if (
        team.status == models.RescueTeamStatus.deployed
        and team.assigned_incident_id != incident_id
    ):
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


# ---------------------------------------------------------------------------
# Unassign team from incident
# ---------------------------------------------------------------------------

@router.put("/teams/{team_id}/unassign", response_model=schemas.RescueTeamResponse)
def unassign_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(*_ADMIN_GOV)),
):
    """
    Remove a rescue team's assignment from an incident and set status to 'returning'.
    Admin or government role required.
    """
    team = db.query(models.RescueTeam).filter(models.RescueTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rescue team not found.")

    team.assigned_incident_id = None
    team.status = models.RescueTeamStatus.returning

    db.commit()
    db.refresh(team)
    return team


# ---------------------------------------------------------------------------
# Delete team (admin only)
# ---------------------------------------------------------------------------

@router.delete("/teams/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(models.UserRole.admin)),
):
    """Delete a rescue team record. Admin access required."""
    team = db.query(models.RescueTeam).filter(models.RescueTeam.id == team_id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rescue team not found.")

    db.delete(team)
    db.commit()
