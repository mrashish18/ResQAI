"""
Resource management routes for ResQAI.
Manages disaster relief inventory across categories.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/resources", tags=["Resources"])


@router.get("/summary", response_model=List[schemas.ResourceSummary])
def get_resource_summary(db: Session = Depends(get_db)):
    """
    Return aggregated resource levels grouped by category.
    Publicly accessible.
    """
    results = (
        db.query(
            models.Resource.category,
            func.sum(models.Resource.quantity).label("total_quantity"),
            models.Resource.unit,
        )
        .group_by(models.Resource.category, models.Resource.unit)
        .all()
    )

    return [
        schemas.ResourceSummary(
            category=row.category.value if hasattr(row.category, "value") else str(row.category),
            total_quantity=row.total_quantity,
            unit=row.unit,
        )
        for row in results
    ]


@router.get("/", response_model=List[schemas.ResourceResponse])
def list_resources(
    category: Optional[str] = Query(None, description="Filter by resource category"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """List all resources optionally filtered by category. Publicly accessible."""
    query = db.query(models.Resource)

    if category:
        valid_categories = [c.value for c in models.ResourceCategory]
        if category not in valid_categories:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid category. Choose from: {valid_categories}",
            )
        query = query.filter(models.Resource.category == category)

    resources = query.order_by(models.Resource.category).offset(skip).limit(limit).all()
    return resources


@router.put("/{resource_id}", response_model=schemas.ResourceResponse)
def update_resource(
    resource_id: int,
    update: schemas.ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Update a resource quantity or warehouse location. Admin or NGO required."""
    allowed_roles = {
        models.UserRole.admin,
        models.UserRole.ngo,
        models.UserRole.government,
    }
    if current_user.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges to update resources.",
        )

    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")

    update_data = update.model_dump(exclude_unset=True)
    if "quantity" in update_data and update_data["quantity"] < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Resource quantity cannot be negative.",
        )

    for field, value in update_data.items():
        setattr(resource, field, value)

    db.commit()
    db.refresh(resource)
    return resource
