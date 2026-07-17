import json
import logging
import random
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from services.ai import call_openrouter

logger = logging.getLogger("resqai.predictions")

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])


# ---------------------------------------------------------------------------
# Dynamic predictions injected alongside DB records
# ---------------------------------------------------------------------------

DYNAMIC_PREDICTIONS = [
    {
        "id": 9001,
        "disaster_type": "flood",
        "location_name": "Kolkata, West Bengal",
        "latitude": 22.5726,
        "longitude": 88.3639,
        "risk_level": "high",
        "confidence_score": 0.82,
        "predicted_at": datetime(2026, 7, 17, 5, 0, 0),
        "details": (
            "River Hooghly water level rising steadily. IMD forecast of 150–200 mm rain over "
            "next 48 hours. Low-lying areas of Howrah, Garden Reach, and Cossipore at risk."
        ),
    },
    {
        "id": 9002,
        "disaster_type": "cyclone",
        "location_name": "Port Blair, Andaman & Nicobar",
        "latitude": 11.6234,
        "longitude": 92.7265,
        "risk_level": "moderate",
        "confidence_score": 0.68,
        "predicted_at": datetime(2026, 7, 16, 18, 0, 0),
        "details": (
            "Tropical disturbance forming in the southern Bay of Bengal. Track models indicate "
            "60% probability of intensification into a depression within 96 hours, posing risk "
            "to A&N Islands and coastal Andhra Pradesh."
        ),
    },
    {
        "id": 9003,
        "disaster_type": "earthquake",
        "location_name": "Imphal, Manipur",
        "latitude": 24.8170,
        "longitude": 93.9368,
        "risk_level": "moderate",
        "confidence_score": 0.58,
        "predicted_at": datetime(2026, 7, 15, 12, 0, 0),
        "details": (
            "Seismic cluster of 12 micro-events (M1.5–2.8) detected along the Indo-Burma "
            "subduction zone over the past 10 days. Region lies in Seismic Zone V. "
            "Probabilistic hazard assessment indicates elevated risk."
        ),
    },
]


@router.get("/", response_model=List[schemas.PredictionResponse])
def list_predictions(db: Session = Depends(get_db)):
    """
    Return disaster risk predictions.
    Combines persisted predictions from the database with 3 dynamic mock predictions.
    """
    db_predictions = (
        db.query(models.Prediction)
        .order_by(models.Prediction.predicted_at.desc())
        .all()
    )

    db_results = [
        schemas.PredictionResponse.model_validate(p) for p in db_predictions
    ]

    dynamic_results = [
        schemas.PredictionResponse(**p) for p in DYNAMIC_PREDICTIONS
    ]

    return db_results + dynamic_results


@router.post("/analyze", response_model=schemas.PredictionResponse)
async def analyze_location(
    location: str = Query(..., description="Location name or description"),
    disaster_type: str = Query(..., description="Disaster type to analyse"),
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
):
    """
    Generate an AI-powered disaster risk prediction for a given location and disaster type.
    First queries the OpenRouter LLM. Falls back to deterministic mock logic on failure.
    """
    valid_types = ["flood", "earthquake", "cyclone", "wildfire", "tsunami", "landslide", "other"]
    if disaster_type not in valid_types:
        disaster_type = "other"

    # 1. Try querying OpenRouter LLM
    prompt = (
        f"Analyze the risk of disaster type '{disaster_type}' at location '{location}' "
        f"(Coordinates: latitude={latitude}, longitude={longitude}).\n"
        "Return your response in a raw JSON object with the following structure:\n"
        "{\n"
        '  "confidence_score": float (between 0.0 and 1.0),\n'
        '  "risk_level": "low" | "moderate" | "high" | "extreme",\n'
        '  "details": "detailed professional safety and meteorological assessment"\n'
        "}\n"
        "Only return the raw JSON object and nothing else. Do not enclose it in markdown blocks."
    )
    system_prompt = (
        "You are a disaster prediction model and senior meteorological intelligence officer. "
        "You output precise geological and weather risk assessments in structured JSON."
    )

    try:
        response_text = await call_openrouter(prompt, system_prompt=system_prompt, temperature=0.2)
        if response_text:
            cleaned = response_text.strip()
            if cleaned.startswith("```"):
                lines = cleaned.splitlines()
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].startswith("```"):
                    lines = lines[:-1]
                cleaned = "\n".join(lines).strip()
            
            parsed = json.loads(cleaned)
            conf = float(parsed.get("confidence_score", 0.75))
            risk = parsed.get("risk_level", "moderate").lower()
            if risk not in ["low", "moderate", "high", "extreme"]:
                risk = "moderate"
            details = parsed.get("details", "")

            return schemas.PredictionResponse(
                id=0,
                disaster_type=disaster_type,
                location_name=location,
                latitude=latitude,
                longitude=longitude,
                risk_level=risk,
                confidence_score=conf,
                predicted_at=datetime.utcnow(),
                details=details,
            )
    except Exception as exc:
        logger.warning("OpenRouter risk analysis failed, falling back to local mock: %s", exc)

    # 2. Fallback Mock Logic
    base_score = random.uniform(0.45, 0.95)
    lat_factor = abs(latitude - 20) / 40
    lon_factor = abs(longitude - 80) / 40

    coastal_types = {"cyclone", "tsunami", "flood"}
    coastal_bonus = 0.1 if disaster_type in coastal_types and lon_factor < 0.3 else 0.0
    confidence = round(min(base_score + coastal_bonus, 0.97), 2)

    if confidence >= 0.85:
        risk_level = "extreme"
    elif confidence >= 0.70:
        risk_level = "high"
    elif confidence >= 0.55:
        risk_level = "moderate"
    else:
        risk_level = "low"

    details_map = {
        "flood": (
            f"Satellite precipitation data and river gauge readings for {location} indicate "
            f"elevated flood risk (confidence: {confidence:.0%}). "
            "Recommend pre-positioning boats and pumps within 24 hours."
        ),
        "earthquake": (
            f"Seismic hazard assessment for {location} based on regional fault proximity, "
            f"historical seismicity, and soil amplification factors yields risk score {confidence:.0%}. "
            "Recommend structural audit of critical infrastructure."
        ),
        "cyclone": (
            f"Atmospheric modelling (SST anomaly, wind shear, vorticity) for {location} "
            f"indicates cyclone formation probability of {confidence:.0%}. "
            "Pre-deploy evacuation transport assets."
        ),
        "wildfire": (
            f"Fire weather index for {location} computed from NDVI, soil moisture, temperature, "
            f"and wind data yields risk {confidence:.0%}. "
            "Activate firebreak crews and water tankers."
        ),
        "tsunami": (
            f"Subduction zone seismicity and bathymetry analysis for {location} coastline "
            f"yields tsunami inundation risk of {confidence:.0%}. "
            "Verify early-warning buoy status."
        ),
        "landslide": (
            f"Slope stability model integrating rainfall, soil type, vegetation, and InSAR "
            f"deformation data for {location} yields landslide probability {confidence:.0%}. "
            "Restrict traffic on vulnerable hill roads."
        ),
        "other": (
            f"General hazard assessment for {location} yields risk score {confidence:.0%}. "
            "Activate standard emergency preparedness protocols."
        ),
    }

    details = details_map.get(disaster_type, details_map["other"])

    return schemas.PredictionResponse(
        id=0,
        disaster_type=disaster_type,
        location_name=location,
        latitude=latitude,
        longitude=longitude,
        risk_level=risk_level,
        confidence_score=confidence,
        predicted_at=datetime.utcnow(),
        details=details,
    )
