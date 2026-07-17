"""
Shelter management routes for ResQAI.
Lists and manages emergency shelters / relief camps.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/shelters", tags=["Shelters"])


@router.get("/", response_model=List[schemas.ShelterResponse])
def list_shelters(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """List all shelters. Publicly accessible."""
    shelters = (
        db.query(models.Shelter)
        .order_by(models.Shelter.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return shelters


@router.post("/", response_model=schemas.ShelterResponse, status_code=status.HTTP_201_CREATED)
def create_shelter(
    shelter_in: schemas.ShelterCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Create a new shelter record. Admin or government access required."""
    allowed_roles = {models.UserRole.admin, models.UserRole.government}
    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or government role required to create shelters.",
        )

    if shelter_in.current_occupancy > shelter_in.capacity:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Current occupancy cannot exceed total capacity.",
        )

    shelter = models.Shelter(**shelter_in.model_dump())
    db.add(shelter)
    db.commit()
    db.refresh(shelter)
    return shelter


@router.put("/{shelter_id}", response_model=schemas.ShelterResponse)
def update_shelter(
    shelter_id: int,
    update: schemas.ShelterUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Update a shelter's details. Admin, government, or NGO can update."""
    allowed_roles = {models.UserRole.admin, models.UserRole.government, models.UserRole.ngo}
    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges to update shelter records.",
        )

    shelter = db.query(models.Shelter).filter(models.Shelter.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shelter not found.")

    update_data = update.model_dump(exclude_unset=True)

    # Validate occupancy vs capacity
    new_occupancy = update_data.get("current_occupancy", shelter.current_occupancy)
    new_capacity = update_data.get("capacity", shelter.capacity)
    if new_occupancy > new_capacity:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Current occupancy cannot exceed total capacity.",
        )

    # Auto-update status based on occupancy
    if "current_occupancy" in update_data or "capacity" in update_data:
        if new_occupancy >= new_capacity:
            update_data["status"] = "full"
        elif update_data.get("status") == "full" and new_occupancy < new_capacity:
            update_data["status"] = "open"

    for field, value in update_data.items():
        setattr(shelter, field, value)

    db.commit()
    db.refresh(shelter)
    return shelter
