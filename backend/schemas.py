"""
Pydantic v2 schemas for request validation and response serialization in ResQAI.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ---------------------------------------------------------------------------
# User schemas
# ---------------------------------------------------------------------------

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=6)
    role: Optional[str] = "citizen"
    phone: Optional[str] = None


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
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ---------------------------------------------------------------------------
# Incident schemas
# ---------------------------------------------------------------------------

class IncidentCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=500)
    type: str
    severity: str
    latitude: float
    longitude: float
    description: Optional[str] = None
    status: Optional[str] = "active"


class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    severity: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
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
    incident_type: str
    severity: str
    latitude: float
    longitude: float
    description: Optional[str] = None
    people_count: int = Field(default=1, ge=1)
    medical_emergency: bool = False
    image_url: Optional[str] = None


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
    address: str
    latitude: float
    longitude: float
    capacity: int = Field(..., ge=1)
    current_occupancy: int = Field(default=0, ge=0)
    contact: Optional[str] = None
    status: Optional[str] = "open"


class ShelterUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    capacity: Optional[int] = None
    current_occupancy: Optional[int] = None
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

class RescueTeamUpdate(BaseModel):
    status: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
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

class ResourceUpdate(BaseModel):
    quantity: Optional[float] = None
    warehouse_location: Optional[str] = None


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
    user_id: Optional[int] = None  # None = broadcast
    type: str
    title: str
    message: str
    priority: Optional[str] = "normal"


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
