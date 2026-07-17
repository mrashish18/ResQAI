"""
SQLAlchemy ORM models for ResQAI backend.
Defines all database tables and their relationships.
"""

import enum
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from database import Base


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class UserRole(str, enum.Enum):
    citizen = "citizen"
    admin = "admin"
    rescue_team = "rescue_team"
    volunteer = "volunteer"
    ngo = "ngo"
    government = "government"


class IncidentType(str, enum.Enum):
    flood = "flood"
    earthquake = "earthquake"
    cyclone = "cyclone"
    wildfire = "wildfire"
    tsunami = "tsunami"
    landslide = "landslide"
    other = "other"


class SeverityLevel(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class IncidentStatus(str, enum.Enum):
    active = "active"
    resolved = "resolved"
    monitoring = "monitoring"


class RescueTeamStatus(str, enum.Enum):
    available = "available"
    deployed = "deployed"
    returning = "returning"


class ResourceCategory(str, enum.Enum):
    food = "food"
    water = "water"
    medicine = "medicine"
    blankets = "blankets"
    vehicles = "vehicles"
    equipment = "equipment"


class RiskLevel(str, enum.Enum):
    low = "low"
    moderate = "moderate"
    high = "high"
    extreme = "extreme"


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class User(Base):
    """Application user model covering all roles."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.citizen, nullable=False)
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    incidents = relationship("Incident", back_populates="reporter", foreign_keys="Incident.reporter_id")
    sos_reports = relationship("SOSReport", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class Incident(Base):
    """Disaster incident reported in the system."""

    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    type = Column(Enum(IncidentType), nullable=False)
    severity = Column(Enum(SeverityLevel), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.active, nullable=False)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    reporter = relationship("User", back_populates="incidents", foreign_keys=[reporter_id])
    rescue_teams = relationship("RescueTeam", back_populates="assigned_incident")


class SOSReport(Base):
    """Emergency SOS report submitted by a citizen."""

    __tablename__ = "sos_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    incident_type = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    people_count = Column(Integer, default=1, nullable=False)
    medical_emergency = Column(Boolean, default=False, nullable=False)
    image_url = Column(String(500), nullable=True)
    status = Column(String(50), default="pending", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="sos_reports")


class Shelter(Base):
    """Emergency shelter / relief camp."""

    __tablename__ = "shelters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False)
    address = Column(String(1000), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Integer, nullable=False)
    current_occupancy = Column(Integer, default=0, nullable=False)
    contact = Column(String(100), nullable=True)
    status = Column(String(50), default="open", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class RescueTeam(Base):
    """Rescue team available for deployment."""

    __tablename__ = "rescue_teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False)
    status = Column(Enum(RescueTeamStatus), default=RescueTeamStatus.available, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    members_count = Column(Integer, default=10, nullable=False)
    specialization = Column(String(255), nullable=True)
    assigned_incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    assigned_incident = relationship("Incident", back_populates="rescue_teams")


class Resource(Base):
    """Inventory resource (food, water, medicine, etc.)."""

    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(500), nullable=False)
    category = Column(Enum(ResourceCategory), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), nullable=False)
    warehouse_location = Column(String(500), nullable=False)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Notification(Base):
    """System notification for users or broadcast."""

    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # None = broadcast
    type = Column(String(100), nullable=False)
    title = Column(String(500), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    priority = Column(String(50), default="normal", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="notifications")


class Prediction(Base):
    """AI-generated disaster risk prediction."""

    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    disaster_type = Column(String(100), nullable=False)
    location_name = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    risk_level = Column(Enum(RiskLevel), nullable=False)
    confidence_score = Column(Float, nullable=False)  # 0.0 – 1.0
    predicted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    details = Column(Text, nullable=True)
