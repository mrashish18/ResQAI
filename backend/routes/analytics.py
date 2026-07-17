"""
Analytics routes for ResQAI.
Provides summary statistics and chart data for the dashboard.
"""

from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/summary", response_model=schemas.AnalyticsSummary)
def get_summary(db: Session = Depends(get_db)):
    """
    Return high-level summary statistics for the dashboard.
    Publicly accessible.
    """
    total_incidents = db.query(models.Incident).count()
    active_incidents = (
        db.query(models.Incident)
        .filter(models.Incident.status == models.IncidentStatus.active)
        .count()
    )
    resolved_incidents = (
        db.query(models.Incident)
        .filter(models.Incident.status == models.IncidentStatus.resolved)
        .count()
    )
    monitoring_incidents = (
        db.query(models.Incident)
        .filter(models.Incident.status == models.IncidentStatus.monitoring)
        .count()
    )

    # Shelters with available space
    shelters_available = (
        db.query(models.Shelter)
        .filter(models.Shelter.status == "open")
        .count()
    )

    # Rescue teams currently deployed
    rescue_teams_deployed = (
        db.query(models.RescueTeam)
        .filter(models.RescueTeam.status == models.RescueTeamStatus.deployed)
        .count()
    )

    # Volunteers active = users with volunteer role
    volunteers_active = (
        db.query(models.User)
        .filter(models.User.role == models.UserRole.volunteer, models.User.is_active == True)
        .count()
    )

    # Estimate people rescued from shelter occupancy
    shelter_occupancy = (
        db.query(func.sum(models.Shelter.current_occupancy)).scalar() or 0
    )

    total_sos = db.query(models.SOSReport).count()
    pending_sos = (
        db.query(models.SOSReport)
        .filter(models.SOSReport.status == "pending")
        .count()
    )

    return schemas.AnalyticsSummary(
        total_incidents=total_incidents,
        active_incidents=active_incidents,
        resolved_incidents=resolved_incidents,
        monitoring_incidents=monitoring_incidents,
        people_rescued=int(shelter_occupancy),
        shelters_available=shelters_available,
        rescue_teams_deployed=rescue_teams_deployed,
        volunteers_active=volunteers_active,
        total_sos_reports=total_sos,
        pending_sos=pending_sos,
    )


@router.get("/incidents", response_model=List[schemas.IncidentTypeCount])
def get_incidents_by_type(db: Session = Depends(get_db)):
    """
    Return incident counts grouped by type.
    Suitable for a bar or pie chart.
    """
    results = (
        db.query(models.Incident.type, func.count(models.Incident.id).label("count"))
        .group_by(models.Incident.type)
        .all()
    )

    return [
        schemas.IncidentTypeCount(
            type=row.type.value if hasattr(row.type, "value") else str(row.type),
            count=row.count,
        )
        for row in results
    ]


@router.get("/trends", response_model=List[schemas.DayTrend])
def get_incident_trends(db: Session = Depends(get_db)):
    """
    Return the number of incidents reported per day over the last 7 days.
    Suitable for a line chart.
    """
    today = datetime.utcnow().date()
    trends = []

    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime(day.year, day.month, day.day, 0, 0, 0)
        day_end = datetime(day.year, day.month, day.day, 23, 59, 59)

        count = (
            db.query(models.Incident)
            .filter(
                models.Incident.created_at >= day_start,
                models.Incident.created_at <= day_end,
            )
            .count()
        )

        trends.append(schemas.DayTrend(date=day.strftime("%Y-%m-%d"), count=count))

    return trends


@router.get("/resources", response_model=List[schemas.ResourceSummary])
def get_resource_analytics(db: Session = Depends(get_db)):
    """
    Return aggregated resource levels by category for dashboard charts.
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
            total_quantity=round(row.total_quantity, 2),
            unit=row.unit,
        )
        for row in results
    ]
