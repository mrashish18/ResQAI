"""
Notification routes for ResQAI.
Handles user-specific and broadcast notifications.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("/", response_model=List[schemas.NotificationResponse])
def get_notifications(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Get notifications for the current user.
    Returns both notifications addressed to this user and broadcast notifications (user_id=None).
    Ordered newest first.
    """
    notifications = (
        db.query(models.Notification)
        .filter(
            (models.Notification.user_id == current_user.id)
            | (models.Notification.user_id == None)  # noqa: E711
        )
        .order_by(models.Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return notifications


@router.put("/{notification_id}/read", response_model=schemas.NotificationResponse)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Mark a notification as read."""
    notification = (
        db.query(models.Notification)
        .filter(models.Notification.id == notification_id)
        .first()
    )
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found.",
        )

    # Ensure user can only mark their own or broadcast notifications
    if notification.user_id is not None and notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot modify this notification.",
        )

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


@router.post("/", response_model=schemas.NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_notification(
    notif_in: schemas.NotificationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """Create a new notification. Admin access required."""
    if current_user.role != models.UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required to create notifications.",
        )

    # If targeting a specific user, verify that user exists
    if notif_in.user_id is not None:
        target_user = db.query(models.User).filter(models.User.id == notif_in.user_id).first()
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Target user with ID {notif_in.user_id} not found.",
            )

    valid_priorities = ["low", "normal", "high", "critical"]
    priority = notif_in.priority if notif_in.priority in valid_priorities else "normal"

    notification = models.Notification(
        user_id=notif_in.user_id,
        type=notif_in.type,
        title=notif_in.title,
        message=notif_in.message,
        priority=priority,
        is_read=False,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
