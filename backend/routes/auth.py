"""
Authentication routes for ResQAI.
Handles user registration, login, profile retrieval, and password changes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import (
    create_access_token,
    get_current_active_user,
    get_password_hash,
    verify_password,
)
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------

@router.post(
    "/register",
    response_model=schemas.Token,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account and return a JWT access token.

    - Email must be unique.
    - Password is hashed with bcrypt before storage.
    - Role defaults to 'citizen' if an invalid/unrecognised role is supplied.
    """
    # Check for duplicate email
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Validate role — fall back to citizen if unknown
    valid_roles = [r.value for r in models.UserRole]
    role = user_in.role if user_in.role in valid_roles else "citizen"

    user = models.User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=role,
        phone=user_in.phone,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(data={"sub": user.email})
    return schemas.Token(
        access_token=access_token,
        token_type="bearer",
        user=schemas.UserResponse.model_validate(user),
    )


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

@router.post(
    "/login",
    response_model=schemas.Token,
    summary="Authenticate and receive a JWT token",
)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate a user with email and password and return a JWT token.

    - Returns 401 for invalid credentials.
    - Returns 400 for deactivated accounts.
    """
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account has been deactivated. Please contact support.",
        )

    access_token = create_access_token(data={"sub": user.email})
    return schemas.Token(
        access_token=access_token,
        token_type="bearer",
        user=schemas.UserResponse.model_validate(user),
    )


# ---------------------------------------------------------------------------
# Current user profile
# ---------------------------------------------------------------------------

@router.get(
    "/me",
    response_model=schemas.UserResponse,
    summary="Get the authenticated user's profile",
)
def get_me(current_user: models.User = Depends(get_current_active_user)):
    """Return the currently authenticated user's profile."""
    return current_user


# ---------------------------------------------------------------------------
# Change password
# ---------------------------------------------------------------------------

@router.put(
    "/change-password",
    status_code=status.HTTP_200_OK,
    summary="Change the authenticated user's password",
)
def change_password(
    payload: schemas.ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    """
    Change the authenticated user's password.

    - Requires the current (old) password for verification.
    - New password must be at least 6 characters.
    - Returns 400 if the old password is incorrect.
    """
    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    if payload.old_password == payload.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the current password.",
        )

    current_user.hashed_password = get_password_hash(payload.new_password)
    db.commit()

    return {"message": "Password changed successfully."}
