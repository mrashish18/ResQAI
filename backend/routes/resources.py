"""
Resource management routes for ResQAI.
Manages disaster relief inventory across categories.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import get_current_active_user, require_roles
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/resources", tags=["Resources"])

_RESOURCE_MANAGERS = (
    models.UserRole.admin,
    models.UserRole.ngo,
    models.UserRole.government,
)


# ---------------------------------------------------------------------------
# Summary — must be defined BEFORE the "/{resource_id}" route to avoid clash
# ---------------------------------------------------------------------------

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
            total_quantity=round(float(row.total_quantity), 2),
            unit=row.unit,
        )
        for row in results
    ]


# ---------------------------------------------------------------------------
# List resources
# ---------------------------------------------------------------------------

@router.get("/", response_model=List[schemas.ResourceResponse])
def list_resources(
    category: Optional[str] = Query(None, description="Filter by resource category"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """List all resources, optionally filtered by category. Publicly accessible."""
    query = db.query(models.Resource)

    if category:
        valid_categories = [c.value for c in models.ResourceCategory]
        if category not in valid_categories:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid category. Choose from: {valid_categories}",
            )
        query = query.filter(models.Resource.category == category)

    return query.order_by(models.Resource.category).offset(skip).limit(limit).all()


# ---------------------------------------------------------------------------
# Create resource
# ---------------------------------------------------------------------------

@router.post("/", response_model=schemas.ResourceResponse, status_code=status.HTTP_201_CREATED)
def create_resource(
    resource_in: schemas.ResourceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(*_RESOURCE_MANAGERS)),
):
    """
    Create a new resource / inventory record.
    Admin, NGO, or government role required.
    """
    valid_categories = [c.value for c in models.ResourceCategory]
    if resource_in.category not in valid_categories:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid category. Choose from: {valid_categories}",
        )

    resource = models.Resource(
        name=resource_in.name,
        category=resource_in.category,
        quantity=resource_in.quantity,
        unit=resource_in.unit,
        warehouse_location=resource_in.warehouse_location,
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource


# ---------------------------------------------------------------------------
# Resource Distribution
# ---------------------------------------------------------------------------

@router.post("/distribute", response_model=schemas.ReliefDistributionResponse, status_code=status.HTTP_201_CREATED)
def distribute_resource(
    payload: schemas.ReliefDistributionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(*_RESOURCE_MANAGERS)),
):
    """
    Distribute a quantity of a resource to a relief center, shelter, or incident.
    NGO, Government, or Admin roles required.
    Reduces inventory stock accordingly.
    """
    resource = db.query(models.Resource).filter(models.Resource.id == payload.resource_id).first()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")

    if resource.quantity < payload.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Available: {resource.quantity} {resource.unit}, requested: {payload.quantity} {resource.unit}.",
        )

    # Deduct quantity from stock
    resource.quantity -= payload.quantity

    # Log distribution
    distribution = models.ReliefDistribution(
        resource_id=payload.resource_id,
        quantity=payload.quantity,
        distributed_to=payload.distributed_to,
        incident_id=payload.incident_id,
        status=payload.status or "delivered",
    )
    db.add(distribution)
    db.commit()
    db.refresh(distribution)
    return distribution


@router.get("/distributions", response_model=List[schemas.ReliefDistributionResponse])
def list_distributions(
    incident_id: Optional[int] = Query(None, description="Filter by incident ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """
    List all recorded relief distributions.
    Publicly accessible.
    """
    query = db.query(models.ReliefDistribution)
    if incident_id:
        query = query.filter(models.ReliefDistribution.incident_id == incident_id)

    return query.order_by(models.ReliefDistribution.distributed_at.desc()).offset(skip).limit(limit).all()


# ---------------------------------------------------------------------------
# Get single resource
# ---------------------------------------------------------------------------

@router.get("/{resource_id}", response_model=schemas.ResourceResponse)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific resource by ID. Publicly accessible."""
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")
    return resource


# ---------------------------------------------------------------------------
# Update resource
# ---------------------------------------------------------------------------

@router.put("/{resource_id}", response_model=schemas.ResourceResponse)
def update_resource(
    resource_id: int,
    update: schemas.ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(*_RESOURCE_MANAGERS)),
):
    """
    Update a resource's quantity, name, or warehouse location.
    Admin, NGO, or government role required.
    """
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


# ---------------------------------------------------------------------------
# Delete resource (admin only)
# ---------------------------------------------------------------------------

@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(models.UserRole.admin)),
):
    """Delete a resource record. Admin access required."""
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")

    db.delete(resource)
    db.commit()


