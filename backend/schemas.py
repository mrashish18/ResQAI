"""
Pydantic v2 schemas for request validation and response serialization in ResQAI.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator


# ---------------------------------------------------------------------------
# User schemas
# ---------------------------------------------------------------------------

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=6, description="Minimum 6 characters")
    role: Optional[str] = "citizen"
    phone: Optional[str] = Field(None, max_length=20)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    role: Optional[str] = None
    is_active: Optional[bool] = None


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., min_length=1, description="Current password")
    new_password: str = Field(..., min_length=6, description="New password (min 6 chars)")


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ---------------------------------------------------------------------------
# Incident schemas
# ---------------------------------------------------------------------------

class IncidentCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=500)
    type: str = Field(..., description="Incident type: flood | earthquake | cyclone | wildfire | tsunami | landslide | other")
    severity: str = Field(..., description="Severity: low | medium | high | critical")
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[str] = "active"


class IncidentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=500)
    type: Optional[str] = None
    severity: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    description: Optional[str] = None
    status: Optional[str] = None


class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    type: str
    severity: str
    latitude: float
    longitude: float
    description: Optional[str] = None
    status: str
    reporter_id: Optional[int] = None
    created_at: datetime


# ---------------------------------------------------------------------------
# SOS schemas
# ---------------------------------------------------------------------------

class SOSCreate(BaseModel):
    incident_type: str = Field(..., description="Type of emergency (e.g. flood, earthquake)")
    severity: str = Field(..., description="Severity: low | medium | high | critical")
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    description: Optional[str] = Field(None, max_length=500)
    people_count: int = Field(default=1, ge=1, le=10000)
    medical_emergency: bool = False
    image_url: Optional[str] = Field(None, max_length=500)


class SOSStatusUpdate(BaseModel):
    status: str = Field(..., description="New status: pending | acknowledged | in_progress | resolved | cancelled")


class SOSResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    incident_type: str
    severity: str
    latitude: float
    longitude: float
    description: Optional[str] = None
    people_count: int
    medical_emergency: bool
    image_url: Optional[str] = None
    status: str
    created_at: datetime


# ---------------------------------------------------------------------------
# Shelter schemas
# ---------------------------------------------------------------------------

class ShelterCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=500)
    address: str = Field(..., max_length=1000)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    capacity: int = Field(..., ge=1)
    current_occupancy: int = Field(default=0, ge=0)
    contact: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = "open"


class ShelterUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=500)
    address: Optional[str] = None
    capacity: Optional[int] = Field(None, ge=1)
    current_occupancy: Optional[int] = Field(None, ge=0)
    contact: Optional[str] = None
    status: Optional[str] = None


class ShelterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    address: str
    latitude: float
    longitude: float
    capacity: int
    current_occupancy: int
    contact: Optional[str] = None
    status: str
    created_at: datetime


# ---------------------------------------------------------------------------
# Rescue Team schemas
# ---------------------------------------------------------------------------

class RescueTeamCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=500)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    members_count: int = Field(default=10, ge=1)
    specialization: Optional[str] = Field(None, max_length=255)
    status: Optional[str] = "available"


class RescueTeamUpdate(BaseModel):
    status: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    members_count: Optional[int] = Field(None, ge=1)
    specialization: Optional[str] = None
    assigned_incident_id: Optional[int] = None


class RescueTeamResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    status: str
    latitude: float
    longitude: float
    members_count: int
    specialization: Optional[str] = None
    assigned_incident_id: Optional[int] = None
    created_at: datetime


# ---------------------------------------------------------------------------
# Resource schemas
# ---------------------------------------------------------------------------

class ResourceCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=500)
    category: str = Field(..., description="Category: food | water | medicine | blankets | vehicles | equipment")
    quantity: float = Field(..., ge=0)
    unit: str = Field(..., max_length=50)
    warehouse_location: str = Field(..., max_length=500)


class ResourceUpdate(BaseModel):
    quantity: Optional[float] = Field(None, ge=0)
    warehouse_location: Optional[str] = Field(None, max_length=500)
    name: Optional[str] = Field(None, max_length=500)


class ResourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str
    quantity: float
    unit: str
    warehouse_location: str
    last_updated: datetime


# ---------------------------------------------------------------------------
# Notification schemas
# ---------------------------------------------------------------------------

class NotificationCreate(BaseModel):
    user_id: Optional[int] = Field(None, description="Target user ID; None = broadcast to all")
    type: str = Field(..., max_length=100, description="Notification type (alert, update, info, etc.)")
    title: str = Field(..., max_length=500)
    message: str = Field(..., max_length=2000)
    priority: Optional[str] = Field("normal", description="Priority: low | normal | high | critical")


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    type: str
    title: str
    message: str
    is_read: bool
    priority: str
    created_at: datetime


# ---------------------------------------------------------------------------
# Prediction schemas
# ---------------------------------------------------------------------------

class PredictionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    disaster_type: str
    location_name: str
    latitude: float
    longitude: float
    risk_level: str
    confidence_score: float
    predicted_at: datetime
    details: Optional[str] = None


# ---------------------------------------------------------------------------
# Analytics schemas
# ---------------------------------------------------------------------------

class AnalyticsSummary(BaseModel):
    total_incidents: int
    active_incidents: int
    resolved_incidents: int
    monitoring_incidents: int
    people_rescued: int
    shelters_available: int
    rescue_teams_deployed: int
    volunteers_active: int
    total_sos_reports: int
    pending_sos: int


class IncidentTypeCount(BaseModel):
    type: str
    count: int


class DayTrend(BaseModel):
    date: str
    count: int


class ResourceSummary(BaseModel):
    category: str
    total_quantity: float
    unit: str


# ---------------------------------------------------------------------------
# Chatbot schemas
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    response: str
    response_time: float  # milliseconds
    confidence: float     # 0.0 – 1.0
    category: str


# ---------------------------------------------------------------------------
# Weather schemas
# ---------------------------------------------------------------------------

class WeatherAlert(BaseModel):
    type: str
    severity: str
    message: str


class WeatherResponse(BaseModel):
    city: str
    state: str
    temperature: float        # Celsius
    feels_like: float
    humidity: int             # percent
    wind_speed: float         # km/h
    wind_direction: str
    condition: str
    visibility: float         # km
    pressure: int             # hPa
    alerts: List[WeatherAlert]
    risk_level: str
    last_updated: str


# ---------------------------------------------------------------------------
# Upload schemas
# ---------------------------------------------------------------------------

class UploadResponse(BaseModel):
    url: str
    filename: str
    folder: str
    uploaded_by: str


# ---------------------------------------------------------------------------
# Volunteer Task schemas
# ---------------------------------------------------------------------------

class VolunteerTaskCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: str = Field(..., min_length=5, max_length=2000)
    location: str = Field(..., min_length=2, max_length=500)
    required_skills: List[str] = Field(..., description="List of required skills")
    priority: Optional[str] = "medium"  # low, medium, high, critical
    due_date: Optional[datetime] = None
    incident_id: Optional[int] = None


class VolunteerTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    required_skills: Optional[List[str]] = None
    priority: Optional[str] = None
    status: Optional[str] = None  # open, accepted, completed
    assigned_to: Optional[int] = None
    due_date: Optional[datetime] = None
    incident_id: Optional[int] = None


class VolunteerTaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    location: str
    required_skills: List[str]
    assigned_to: Optional[int] = None
    incident_id: Optional[int] = None
    status: str
    priority: str
    due_date: Optional[datetime] = None
    created_at: datetime

    @field_validator("required_skills", mode="before")
    @classmethod
    def parse_required_skills(cls, v):
        if isinstance(v, str):
            return [s.strip() for s in v.split(",") if s.strip()]
        return v


# ---------------------------------------------------------------------------
# Relief Distribution schemas
# ---------------------------------------------------------------------------

class ReliefDistributionCreate(BaseModel):
    resource_id: int = Field(..., ge=1)
    quantity: float = Field(..., gt=0)
    distributed_to: str = Field(..., min_length=2, max_length=500)
    incident_id: Optional[int] = None
    status: Optional[str] = "delivered"


class ReliefDistributionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    resource_id: int
    resource_name: str
    quantity: float
    distributed_to: str
    distributed_at: datetime
    incident_id: Optional[int] = None
    status: str

