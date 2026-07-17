"""
Authentication routes for ResQAI.
Handles user registration, login, and profile retrieval.
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


@router.post("/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user account and return an access token."""

    # Check for existing email
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Validate role
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


@router.post("/login", response_model=schemas.Token)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticate user with email and password, return JWT token."""

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
            detail="This account has been deactivated.",
        )

    access_token = create_access_token(data={"sub": user.email})
    return schemas.Token(
        access_token=access_token,
        token_type="bearer",
        user=schemas.UserResponse.model_validate(user),
    )


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_active_user)):
    """Return the currently authenticated user's profile."""
    return current_user
