"""
Volunteer management routes for ResQAI.
Handles volunteer tasks, registration, and task assignment.
"""

from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from auth import get_current_active_user, require_roles
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/volunteers", tags=["Volunteers"])

# Roles permitted to manage volunteer tasks
_TASK_MANAGERS = (
    models.UserRole.admin,
    models.UserRole.ngo,
    models.UserRole.government,
)


@router.get("/tasks", response_model=List[schemas.VolunteerTaskResponse])
def list_tasks(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: open | accepted | completed"),
    priority_filter: Optional[str] = Query(None, alias="priority", description="Filter by priority: low | medium | high | critical"),
    assigned_to: Optional[int] = Query(None, description="Filter by assigned user ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """
    List all volunteer tasks with optional filters.
    Accessible to all logged-in users.
    """
    query = db.query(models.VolunteerTask)

    if status_filter:
        query = query.filter(models.VolunteerTask.status == status_filter)
    if priority_filter:
        query = query.filter(models.VolunteerTask.priority == priority_filter)
    if assigned_to:
        query = query.filter(models.VolunteerTask.assigned_to == assigned_to)

    tasks = query.order_by(models.VolunteerTask.created_at.desc()).offset(skip).limit(limit).all()
    return tasks


@router.post("/tasks", response_model=schemas.VolunteerTaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: schemas.VolunteerTaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(*_TASK_MANAGERS)),
):
    """
    Create a new volunteer task.
    NGO, Government, or Admin roles required.
    """
    # Validate priority enum if provided
    valid_priorities = [p.value for p in models.SeverityLevel]
    priority = task_in.priority if task_in.priority in valid_priorities else "medium"

    # Convert required skills list to comma-separated string
    skills_str = ",".join(task_in.required_skills)

    task = models.VolunteerTask(
        title=task_in.title,
        description=task_in.description,
        location=task_in.location,
        required_skills=skills_str,
        priority=priority,
        due_date=task_in.due_date,
        incident_id=task_in.incident_id,
        status="open",
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/tasks/{task_id}", response_model=schemas.VolunteerTaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """Retrieve details of a specific volunteer task."""
    task = db.query(models.VolunteerTask).filter(models.VolunteerTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Volunteer task not found.")
    return task


@router.put("/tasks/{task_id}", response_model=schemas.VolunteerTaskResponse)
def update_task(
    task_id: int,
    update: schemas.VolunteerTaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(*_TASK_MANAGERS)),
):
    """
    Update a volunteer task's attributes.
    NGO, Government, or Admin roles required.
    """
    task = db.query(models.VolunteerTask).filter(models.VolunteerTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Volunteer task not found.")

    update_data = update.model_dump(exclude_unset=True)

    if "required_skills" in update_data and update_data["required_skills"] is not None:
        update_data["required_skills"] = ",".join(update_data["required_skills"])

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


@router.post("/tasks/{task_id}/accept", response_model=schemas.VolunteerTaskResponse)
def accept_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Accept/assign a volunteer task to the currently logged-in user.
    Open to volunteer or admin roles.
    """
    if current_user.role not in (models.UserRole.volunteer, models.UserRole.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only volunteers or admins can accept tasks.",
        )

    task = db.query(models.VolunteerTask).filter(models.VolunteerTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Volunteer task not found.")

    if task.status != "open":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This task is already assigned or completed.",
        )

    task.assigned_to = current_user.id
    task.status = "accepted"

    db.commit()
    db.refresh(task)
    return task


@router.post("/tasks/{task_id}/complete", response_model=schemas.VolunteerTaskResponse)
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Mark an accepted volunteer task as completed.
    Must be the assigned volunteer or an administrator.
    """
    task = db.query(models.VolunteerTask).filter(models.VolunteerTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Volunteer task not found.")

    if task.status != "accepted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only accepted tasks can be marked completed.",
        )

    if task.assigned_to != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not assigned to this task.",
        )

    task.status = "completed"
    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(models.UserRole.admin)),
):
    """Delete a volunteer task. Admin access required."""
    task = db.query(models.VolunteerTask).filter(models.VolunteerTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Volunteer task not found.")

    db.delete(task)
    db.commit()
