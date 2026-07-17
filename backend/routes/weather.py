"""
Weather route for ResQAI.
Returns mock weather data and alerts for major Indian cities.
"""

from typing import List

from fastapi import APIRouter

import schemas

router = APIRouter(prefix="/api/weather", tags=["Weather"])


# ---------------------------------------------------------------------------
# Static mock weather data for 5 major Indian cities
# ---------------------------------------------------------------------------

WEATHER_DATA: List[dict] = [
    {
        "city": "Mumbai",
        "state": "Maharashtra",
        "temperature": 29.4,
        "feels_like": 35.2,
        "humidity": 88,
        "wind_speed": 42.0,
        "wind_direction": "SW",
        "condition": "Heavy Rain",
        "visibility": 3.2,
        "pressure": 996,
        "alerts": [
            {
                "type": "Heavy Rainfall",
                "severity": "red",
                "message": (
                    "IMD Red Alert: Extremely Heavy Rainfall (>204.4 mm) expected over "
                    "Mumbai, Thane, and Raigad in next 24 hours. Avoid low-lying areas."
                ),
            },
            {
                "type": "High Tide Warning",
                "severity": "orange",
                "message": (
                    "High tide of 4.6 m expected at Gateway of India at 14:35 IST. "
                    "Coastal areas and Marine Drive may be flooded."
                ),
            },
        ],
        "risk_level": "high",
        "last_updated": "2026-07-17T10:30:00+05:30",
    },
    {
        "city": "Chennai",
        "state": "Tamil Nadu",
        "temperature": 31.8,
        "feels_like": 38.5,
        "humidity": 82,
        "wind_speed": 65.0,
        "wind_direction": "NE",
        "condition": "Cyclonic Conditions",
        "visibility": 2.5,
        "pressure": 989,
        "alerts": [
            {
                "type": "Cyclone Warning",
                "severity": "red",
                "message": (
                    "Cyclone Warning Signal No. 3 hoisted for Chennai, Tiruvallur, and "
                    "Kancheepuram districts. Wind speed 60–70 km/h gusting to 90 km/h. "
                    "Fishermen must not venture into the sea."
                ),
            },
            {
                "type": "Storm Surge Alert",
                "severity": "red",
                "message": (
                    "Storm surge of 2–3 metres expected along Marina Beach, Besant Nagar, "
                    "and Thiruvanmiyur coast. Immediate evacuation of coastal areas advised."
                ),
            },
        ],
        "risk_level": "extreme",
        "last_updated": "2026-07-17T10:15:00+05:30",
    },
    {
        "city": "Bhubaneswar",
        "state": "Odisha",
        "temperature": 27.2,
        "feels_like": 33.1,
        "humidity": 91,
        "wind_speed": 85.0,
        "wind_direction": "E",
        "condition": "Cyclone Landfall",
        "visibility": 1.0,
        "pressure": 978,
        "alerts": [
            {
                "type": "Cyclone Landfall",
                "severity": "red",
                "message": (
                    "VSCS Biparjoy making landfall near Puri. Wind speed 175–185 km/h. "
                    "DO NOT go outdoors. Stay in sturdy structures. Power cuts expected."
                ),
            },
        ],
        "risk_level": "extreme",
        "last_updated": "2026-07-17T11:00:00+05:30",
    },
    {
        "city": "Guwahati",
        "state": "Assam",
        "temperature": 25.6,
        "feels_like": 29.0,
        "humidity": 94,
        "wind_speed": 22.0,
        "wind_direction": "SE",
        "condition": "Continuous Heavy Rain",
        "visibility": 4.0,
        "pressure": 1002,
        "alerts": [
            {
                "type": "Flood Warning",
                "severity": "red",
                "message": (
                    "Brahmaputra river at Guwahati is flowing above danger mark (55.15 m). "
                    "Low-lying areas of Uzan Bazar, Fancy Bazar, and Panbazar under flood threat."
                ),
            },
            {
                "type": "Landslide Warning",
                "severity": "orange",
                "message": (
                    "Landslide and mudflow warning for Kamrup (Metro) hilly areas and "
                    "Meghalaya border regions. Avoid hill roads."
                ),
            },
        ],
        "risk_level": "high",
        "last_updated": "2026-07-17T09:45:00+05:30",
    },
    {
        "city": "Dehradun",
        "state": "Uttarakhand",
        "temperature": 22.1,
        "feels_like": 23.8,
        "humidity": 79,
        "wind_speed": 18.0,
        "wind_direction": "W",
        "condition": "Moderate Rain",
        "visibility": 6.5,
        "pressure": 1008,
        "alerts": [
            {
                "type": "Flash Flood Watch",
                "severity": "orange",
                "message": (
                    "Cloudbursts possible in upper Uttarakhand hills (Chamoli, Rudraprayag, "
                    "Uttarkashi). Flash flood and landslide risk on all mountain highways. "
                    "Char Dham Yatra pilgrims advised to check before travel."
                ),
            },
        ],
        "risk_level": "moderate",
        "last_updated": "2026-07-17T10:00:00+05:30",
    },
]


@router.get("/", response_model=List[schemas.WeatherResponse])
def get_weather():
    """
    Return current weather conditions and alerts for 5 major Indian disaster-prone cities.
    Data is updated regularly via IMD feeds (mock for development).
    """
    return [
        schemas.WeatherResponse(
            city=w["city"],
            state=w["state"],
            temperature=w["temperature"],
            feels_like=w["feels_like"],
            humidity=w["humidity"],
            wind_speed=w["wind_speed"],
            wind_direction=w["wind_direction"],
            condition=w["condition"],
            visibility=w["visibility"],
            pressure=w["pressure"],
            alerts=[schemas.WeatherAlert(**a) for a in w["alerts"]],
            risk_level=w["risk_level"],
            last_updated=w["last_updated"],
        )
        for w in WEATHER_DATA
    ]
