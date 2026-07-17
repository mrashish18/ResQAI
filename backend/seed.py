"""
Database seeder for ResQAI.
Populates the database with realistic Indian disaster-scenario data.
Only runs if the database is empty (checked via user count).
"""

from datetime import datetime, timedelta
import random

from sqlalchemy.orm import Session

from auth import get_password_hash
import models


# ---------------------------------------------------------------------------
# Seeding helpers
# ---------------------------------------------------------------------------

def _ago(days: int = 0, hours: int = 0) -> datetime:
    return datetime.utcnow() - timedelta(days=days, hours=hours)


# ---------------------------------------------------------------------------
# Main seed function
# ---------------------------------------------------------------------------

def seed_database(db: Session) -> None:
    """Seed all tables if the database is empty."""

    if db.query(models.User).count() > 0:
        print("Database already seeded — skipping.")
        return

    print("Seeding database with initial data...")

    # -----------------------------------------------------------------------
    # Users
    # -----------------------------------------------------------------------
    hashed_pw = get_password_hash("password123")

    users_data = [
        {
            "email": "admin@resqai.in",
            "full_name": "Arjun Sharma",
            "hashed_password": hashed_pw,
            "role": models.UserRole.admin,
            "phone": "+91-9800011111",
        },
        {
            "email": "citizen@resqai.in",
            "full_name": "Priya Patel",
            "hashed_password": hashed_pw,
            "role": models.UserRole.citizen,
            "phone": "+91-9800022222",
        },
        {
            "email": "rescue@resqai.in",
            "full_name": "Capt. Rajan Verma",
            "hashed_password": hashed_pw,
            "role": models.UserRole.rescue_team,
            "phone": "+91-9800033333",
        },
        {
            "email": "volunteer@resqai.in",
            "full_name": "Sneha Menon",
            "hashed_password": hashed_pw,
            "role": models.UserRole.volunteer,
            "phone": "+91-9800044444",
        },
        {
            "email": "ngo@resqai.in",
            "full_name": "Rahul Banerjee",
            "hashed_password": hashed_pw,
            "role": models.UserRole.ngo,
            "phone": "+91-9800055555",
        },
        {
            "email": "govt@resqai.in",
            "full_name": "IAS Kavita Nair",
            "hashed_password": hashed_pw,
            "role": models.UserRole.government,
            "phone": "+91-9800066666",
        },
    ]

    users = []
    for u in users_data:
        user = models.User(**u, is_active=True, created_at=_ago(days=30))
        db.add(user)
        users.append(user)
    db.flush()

    admin_user = users[0]
    citizen_user = users[1]

    # -----------------------------------------------------------------------
    # Incidents – 15 realistic Indian disasters
    # -----------------------------------------------------------------------
    incidents_data = [
        # Kerala floods
        {
            "title": "Severe Flooding in Kochi — Residential Areas Submerged",
            "type": models.IncidentType.flood,
            "severity": models.SeverityLevel.critical,
            "latitude": 9.9312,
            "longitude": 76.2673,
            "description": (
                "Heavy monsoon rainfall has caused the Periyar river to breach its banks near "
                "Aluva, inundating over 2,000 homes in the Ernakulam district. Roads to "
                "Kalady and North Paravur are completely blocked. NDRF teams are conducting "
                "boat rescues. Approximately 12,000 people have been displaced."
            ),
            "status": models.IncidentStatus.active,
            "reporter_id": citizen_user.id,
            "created_at": _ago(hours=3),
        },
        # Uttarakhand earthquake
        {
            "title": "6.2 Magnitude Earthquake Near Chamoli, Uttarakhand",
            "type": models.IncidentType.earthquake,
            "severity": models.SeverityLevel.high,
            "latitude": 30.4025,
            "longitude": 79.3792,
            "description": (
                "A 6.2-magnitude earthquake struck 18 km north-east of Chamoli at 02:34 IST. "
                "Multiple buildings have collapsed in Joshimath and Gopeshwar. Landslides have "
                "blocked National Highway 58. Rescue operations are underway. Tremors felt as "
                "far as Dehradun and Haridwar."
            ),
            "status": models.IncidentStatus.active,
            "reporter_id": admin_user.id,
            "created_at": _ago(hours=6),
        },
        # Odisha cyclone
        {
            "title": "Cyclone Biparjoy Landfall Near Puri, Odisha",
            "type": models.IncidentType.cyclone,
            "severity": models.SeverityLevel.critical,
            "latitude": 19.8135,
            "longitude": 85.8312,
            "description": (
                "Very Severe Cyclonic Storm Biparjoy made landfall near Puri with wind speeds "
                "of 180 km/h. Storm surge of 3–5 m expected along the coastline. Over 4 lakh "
                "people evacuated from coastal districts of Puri, Jagatsinghpur and "
                "Kendrapada. Multiple fishing villages severely damaged."
            ),
            "status": models.IncidentStatus.active,
            "reporter_id": admin_user.id,
            "created_at": _ago(hours=1),
        },
        # Maharashtra wildfire
        {
            "title": "Forest Fire Spreading Across Nashik Districts — Wildlife at Risk",
            "type": models.IncidentType.wildfire,
            "severity": models.SeverityLevel.high,
            "latitude": 20.0059,
            "longitude": 73.7908,
            "description": (
                "A massive forest fire has been raging for 3 days across 8,000 hectares of "
                "the Sahyadri Tiger Reserve near Nashik. Strong winds are fanning the flames "
                "towards tribal hamlets in the Trimbakeshwar area. Indian Air Force choppers "
                "conducting water drops. 5 villages evacuated."
            ),
            "status": models.IncidentStatus.active,
            "reporter_id": citizen_user.id,
            "created_at": _ago(days=3),
        },
        # Tamil Nadu tsunami
        {
            "title": "Tsunami Warning Issued for Tamil Nadu Coastline",
            "type": models.IncidentType.tsunami,
            "severity": models.SeverityLevel.critical,
            "latitude": 13.0827,
            "longitude": 80.2707,
            "description": (
                "A 7.8-magnitude undersea earthquake off the Andaman Islands has triggered a "
                "tsunami warning for the Tamil Nadu coast from Chennai to Rameshwaram. "
                "Evacuation sirens active in coastal districts. Fishing communities in "
                "Nagapattinam and Cuddalore ordered to move 5 km inland immediately."
            ),
            "status": models.IncidentStatus.monitoring,
            "reporter_id": admin_user.id,
            "created_at": _ago(hours=2),
        },
        # Himachal Pradesh landslide
        {
            "title": "Major Landslide Blocks Manali-Leh Highway at Rohtang",
            "type": models.IncidentType.landslide,
            "severity": models.SeverityLevel.high,
            "latitude": 32.3748,
            "longitude": 77.1509,
            "description": (
                "Continuous heavy rainfall triggered a massive landslide near Rohtang Pass, "
                "completely blocking the Manali–Leh Highway (NH-3). Over 300 tourists are "
                "stranded on the Leh side. BRO teams and NDRF deployed for clearing. "
                "Helicopter service to Leh activated."
            ),
            "status": models.IncidentStatus.active,
            "reporter_id": citizen_user.id,
            "created_at": _ago(hours=8),
        },
        # Bihar flood
        {
            "title": "Kosi River Floods Destroy 500 Homes in Supaul, Bihar",
            "type": models.IncidentType.flood,
            "severity": models.SeverityLevel.critical,
            "latitude": 26.1225,
            "longitude": 86.5988,
            "description": (
                "The Kosi river, known as the 'Sorrow of Bihar', has broken embankments at "
                "three points near Supaul. Floodwaters have inundated 500+ homes and swept "
                "away cattle. Over 8,000 people have taken refuge on elevated roads and rail "
                "embankments. Urgent need for boats, food, and medicine."
            ),
            "status": models.IncidentStatus.active,
            "reporter_id": citizen_user.id,
            "created_at": _ago(hours=12),
        },
        # Gujarat earthquake
        {
            "title": "5.4 Magnitude Earthquake Near Bhuj, Gujarat",
            "type": models.IncidentType.earthquake,
            "severity": models.SeverityLevel.medium,
            "latitude": 23.2419,
            "longitude": 69.6669,
            "description": (
                "A 5.4-magnitude earthquake reminiscent of the 2001 Bhuj disaster struck at "
                "08:20 IST, causing panic among residents. Several old structures in Bhuj and "
                "Anjar have developed cracks. No major casualties reported so far. SDRF teams "
                "conducting damage assessment."
            ),
            "status": models.IncidentStatus.monitoring,
            "reporter_id": admin_user.id,
            "created_at": _ago(days=1),
        },
        # Andhra Pradesh cyclone
        {
            "title": "Cyclone Michaung Threatens Andhra Coast — Red Alert Issued",
            "type": models.IncidentType.cyclone,
            "severity": models.SeverityLevel.high,
            "latitude": 16.3067,
            "longitude": 80.4365,
            "description": (
                "Cyclone Michaung is intensifying in the Bay of Bengal and is likely to "
                "make landfall near Machilipatnam within 18 hours. Wind speeds expected at "
                "130–140 km/h. Red alert in Krishna, Guntur, and Prakasam districts. "
                "Coastal communities actively being evacuated."
            ),
            "status": models.IncidentStatus.active,
            "reporter_id": admin_user.id,
            "created_at": _ago(hours=4),
        },
        # Sikkim landslide
        {
            "title": "Flash Floods and Landslides Devastate Sikkim's Teesta Valley",
            "type": models.IncidentType.landslide,
            "severity": models.SeverityLevel.critical,
            "latitude": 27.3389,
            "longitude": 88.6065,
            "description": (
                "A glacial lake outburst flood (GLOF) from South Lhonak Lake has triggered "
                "catastrophic flash floods along the Teesta river. Multiple bridges washed "
                "away. Over 40 Army personnel missing near Bardang. Thousands of residents "
                "in Singtam, Rangpo, and Mangan cut off."
            ),
            "status": models.IncidentStatus.active,
            "reporter_id": citizen_user.id,
            "created_at": _ago(days=2),
        },
        # Rajasthan flood
        {
            "title": "Unusual Flash Floods Hit Jaisalmer and Barmer, Rajasthan",
            "type": models.IncidentType.flood,
            "severity": models.SeverityLevel.medium,
            "latitude": 26.9157,
            "longitude": 70.9083,
            "description": (
                "Unprecedented rainfall in the Thar Desert has caused flash floods in "
                "Jaisalmer and Barmer districts. Dry river beds (nadis) are overflowing. "
                "Several remote villages are cut off. Camel herds and livestock stranded. "
                "Army columns mobilised for rescue."
            ),
            "status": models.IncidentStatus.monitoring,
            "reporter_id": citizen_user.id,
            "created_at": _ago(days=2, hours=5),
        },
        # Uttarakhand forest fire
        {
            "title": "Forest Fires Engulf Nainital Hills — 3000 Hectares Burned",
            "type": models.IncidentType.wildfire,
            "severity": models.SeverityLevel.high,
            "latitude": 29.3803,
            "longitude": 79.4636,
            "description": (
                "Summer forest fires in the Kumaon hills have burned over 3,000 ha of oak "
                "and pine forests around Nainital, Almora, and Bhimtal. Smoke visible from "
                "Haldwani. IAF Mi-17 helicopters airlifting bamboo buckets. Several "
                "eco-tourism facilities evacuated."
            ),
            "status": models.IncidentStatus.resolved,
            "reporter_id": admin_user.id,
            "created_at": _ago(days=7),
        },
        # Mumbai flood
        {
            "title": "Mumbai Records 300mm Rain in 24hrs — Subway and Rail Network Flooded",
            "type": models.IncidentType.flood,
            "severity": models.SeverityLevel.high,
            "latitude": 19.0760,
            "longitude": 72.8777,
            "description": (
                "Extremely Heavy Rainfall battered Mumbai, flooding the Sion, Kurla, Hindmata "
                "and Kings Circle areas. Western and Central Railway services severely "
                "disrupted. Low-lying Dharavi colony inundated. BMC disaster teams deployed. "
                "Red alert in Thane and Raigad."
            ),
            "status": models.IncidentStatus.resolved,
            "reporter_id": citizen_user.id,
            "created_at": _ago(days=5),
        },
        # Assam flood
        {
            "title": "Brahmaputra Flooding Displaces 5 Lakh People in Assam",
            "type": models.IncidentType.flood,
            "severity": models.SeverityLevel.critical,
            "latitude": 26.2006,
            "longitude": 92.9376,
            "description": (
                "Annual monsoon floods in Assam have turned severe this year. The Brahmaputra "
                "and its tributaries are in spate, flooding 32 out of 35 districts. Kaziranga "
                "National Park submerged — rhinos and deer forced onto highways. NDRF deployed "
                "in 18 districts. Over 5 lakh people in relief camps."
            ),
            "status": models.IncidentStatus.active,
            "reporter_id": admin_user.id,
            "created_at": _ago(hours=10),
        },
        # Chennai
        {
            "title": "Cyclone-Induced Storm Surge Inundates Marina Beach Area, Chennai",
            "type": models.IncidentType.cyclone,
            "severity": models.SeverityLevel.medium,
            "latitude": 13.0827,
            "longitude": 80.2707,
            "description": (
                "A depression in the Bay of Bengal has caused heavy waves and a 2-metre storm "
                "surge along Chennai's Marina Beach. Besant Nagar, Thiruvanmiyur and "
                "Foreshore Estate residents evacuated. Fishing boats damaged. NDRF teams on "
                "standby at Nungambakkam."
            ),
            "status": models.IncidentStatus.monitoring,
            "reporter_id": citizen_user.id,
            "created_at": _ago(hours=5),
        },
    ]

    incidents = []
    for inc_data in incidents_data:
        inc = models.Incident(**inc_data)
        db.add(inc)
        incidents.append(inc)
    db.flush()

    # -----------------------------------------------------------------------
    # Shelters
    # -----------------------------------------------------------------------
    shelters_data = [
        {
            "name": "Government Higher Secondary School — Ernakulam Relief Camp",
            "address": "MG Road, Ernakulam, Kerala 682016",
            "latitude": 9.9816,
            "longitude": 76.2999,
            "capacity": 800,
            "current_occupancy": 673,
            "contact": "+91-484-2378900",
            "status": "open",
        },
        {
            "name": "Nehru Stadium Emergency Shelter, Bhubaneswar",
            "address": "Nayapalli, Bhubaneswar, Odisha 751012",
            "latitude": 20.2961,
            "longitude": 85.8245,
            "capacity": 2500,
            "current_occupancy": 1840,
            "contact": "+91-674-2542900",
            "status": "open",
        },
        {
            "name": "District Collector's Relief Centre, Chamoli",
            "address": "Civil Lines, Gopeshwar, Chamoli, Uttarakhand 246401",
            "latitude": 30.3654,
            "longitude": 79.4175,
            "capacity": 400,
            "current_occupancy": 312,
            "contact": "+91-1372-252122",
            "status": "open",
        },
        {
            "name": "Kosi Flood Relief Camp — National Highway 57 Embankment",
            "address": "NH-57, Supaul, Bihar 852131",
            "latitude": 26.1200,
            "longitude": 86.5970,
            "capacity": 1200,
            "current_occupancy": 1200,  # full
            "contact": "+91-6473-222345",
            "status": "full",
        },
        {
            "name": "NDRF Base Camp & Relief Hub, Guwahati",
            "address": "Sarusajai Stadium, Guwahati, Assam 781006",
            "latitude": 26.1854,
            "longitude": 91.7362,
            "capacity": 3000,
            "current_occupancy": 2510,
            "contact": "+91-361-2342567",
            "status": "open",
        },
    ]

    for s in shelters_data:
        shelter = models.Shelter(**s, created_at=_ago(days=1))
        db.add(shelter)
    db.flush()

    # -----------------------------------------------------------------------
    # Rescue Teams
    # -----------------------------------------------------------------------
    rescue_teams_data = [
        {
            "name": "NDRF 5th Battalion — Pune",
            "status": models.RescueTeamStatus.deployed,
            "latitude": 18.5204,
            "longitude": 73.8567,
            "members_count": 45,
            "specialization": "Flood Rescue, CBRN",
            "assigned_incident_id": incidents[0].id,  # Kochi flood
        },
        {
            "name": "SDRF Uttarakhand Alpha Team",
            "status": models.RescueTeamStatus.deployed,
            "latitude": 30.0668,
            "longitude": 79.0193,
            "members_count": 30,
            "specialization": "Mountain Rescue, Earthquake USAR",
            "assigned_incident_id": incidents[1].id,  # Chamoli earthquake
        },
        {
            "name": "Indian Coast Guard — Eastern Region",
            "status": models.RescueTeamStatus.available,
            "latitude": 13.0827,
            "longitude": 80.2707,
            "members_count": 60,
            "specialization": "Marine Rescue, Cyclone Response",
            "assigned_incident_id": None,
        },
        {
            "name": "Army 3rd Engineer Regiment — Assam",
            "status": models.RescueTeamStatus.deployed,
            "latitude": 26.2006,
            "longitude": 92.9376,
            "members_count": 120,
            "specialization": "Bridge Building, Flood Relief, Boat Ops",
            "assigned_incident_id": incidents[13].id,  # Assam flood
        },
    ]

    for rt in rescue_teams_data:
        team = models.RescueTeam(**rt, created_at=_ago(days=10))
        db.add(team)
    db.flush()

    # -----------------------------------------------------------------------
    # Resources
    # -----------------------------------------------------------------------
    resources_data = [
        {
            "name": "Rice (25 kg bags)",
            "category": models.ResourceCategory.food,
            "quantity": 5000.0,
            "unit": "bags",
            "warehouse_location": "NDRF Warehouse, Pune, Maharashtra",
        },
        {
            "name": "Ready-to-Eat Meals (MREs)",
            "category": models.ResourceCategory.food,
            "quantity": 25000.0,
            "unit": "packets",
            "warehouse_location": "Army Stores, Guwahati, Assam",
        },
        {
            "name": "Drinking Water (1 L bottles)",
            "category": models.ResourceCategory.water,
            "quantity": 100000.0,
            "unit": "bottles",
            "warehouse_location": "District Collectorate, Bhubaneswar, Odisha",
        },
        {
            "name": "Water Purification Tablets",
            "category": models.ResourceCategory.water,
            "quantity": 50000.0,
            "unit": "tablets",
            "warehouse_location": "State Emergency Warehouse, Patna, Bihar",
        },
        {
            "name": "ORS (Oral Rehydration Salts)",
            "category": models.ResourceCategory.medicine,
            "quantity": 15000.0,
            "unit": "sachets",
            "warehouse_location": "CMHO Store, Ernakulam, Kerala",
        },
        {
            "name": "First Aid Kits",
            "category": models.ResourceCategory.medicine,
            "quantity": 800.0,
            "unit": "kits",
            "warehouse_location": "NDRF Medical Wing, New Delhi",
        },
        {
            "name": "Woollen Blankets",
            "category": models.ResourceCategory.blankets,
            "quantity": 12000.0,
            "unit": "pieces",
            "warehouse_location": "State Disaster Warehouse, Dehradun, Uttarakhand",
        },
        {
            "name": "Inflatable Rescue Boats (RIBS)",
            "category": models.ResourceCategory.vehicles,
            "quantity": 45.0,
            "unit": "boats",
            "warehouse_location": "NDRF 5th Battalion, Pune, Maharashtra",
        },
        {
            "name": "Flood Light Towers",
            "category": models.ResourceCategory.equipment,
            "quantity": 30.0,
            "unit": "units",
            "warehouse_location": "Civil Defence Depot, Guwahati, Assam",
        },
        {
            "name": "Portable Generators (5 kW)",
            "category": models.ResourceCategory.equipment,
            "quantity": 60.0,
            "unit": "units",
            "warehouse_location": "SDMA Warehouse, Bhubaneswar, Odisha",
        },
    ]

    for r in resources_data:
        resource = models.Resource(**r, last_updated=_ago(hours=2))
        db.add(resource)
    db.flush()

    # -----------------------------------------------------------------------
    # Notifications
    # -----------------------------------------------------------------------
    notifications_data = [
        {
            "user_id": None,  # broadcast
            "type": "alert",
            "title": "🔴 CYCLONE WARNING: Odisha Coast",
            "message": (
                "Very Severe Cyclonic Storm Biparjoy is making landfall near Puri. "
                "Residents in coastal areas must evacuate IMMEDIATELY. Move to nearest relief camp."
            ),
            "priority": "critical",
            "is_read": False,
        },
        {
            "user_id": None,
            "type": "alert",
            "title": "🌊 TSUNAMI WARNING: Tamil Nadu & Andhra Coasts",
            "message": (
                "A tsunami warning has been issued following a 7.8 M earthquake near Andaman. "
                "Do NOT go to the beach. Move at least 5 km inland. This is not a drill."
            ),
            "priority": "critical",
            "is_read": False,
        },
        {
            "user_id": None,
            "type": "update",
            "title": "Kerala Flood Update — NDRF Teams Deployed",
            "message": (
                "50 NDRF rescue teams with 200 boats are now operational in Ernakulam and "
                "Thrissur districts. Helpline: 1078. Nearest shelter: Ernakulam Town Hall."
            ),
            "priority": "high",
            "is_read": False,
        },
        {
            "user_id": None,
            "type": "update",
            "title": "Assam Flood Relief: Air Drops Started",
            "message": (
                "IAF AN-32 aircraft have begun food and medicine airdrops in 12 marooned "
                "villages in Majuli and Morigaon. Army engineers repairing damaged bridges."
            ),
            "priority": "high",
            "is_read": False,
        },
        {
            "user_id": users[1].id,  # citizen user
            "type": "sos_response",
            "title": "Your SOS Report Has Been Received",
            "message": (
                "Your emergency SOS report has been received and assigned to NDRF Team Alpha. "
                "An officer will contact you within 30 minutes. Stay safe and keep your phone on."
            ),
            "priority": "high",
            "is_read": False,
        },
        {
            "user_id": None,
            "type": "info",
            "title": "Helpline Numbers for Disaster Relief",
            "message": (
                "National Emergency: 112 | NDMA: 1078 | Flood Relief: 1070 | "
                "PM Relief Fund: 011-23388151. Stay tuned to All India Radio for updates."
            ),
            "priority": "normal",
            "is_read": False,
        },
        {
            "user_id": None,
            "type": "weather",
            "title": "Red Alert: Extremely Heavy Rainfall — 8 States",
            "message": (
                "IMD has issued a Red Alert for extremely heavy rainfall in Kerala, "
                "Karnataka, Goa, Uttarakhand, Himachal Pradesh, Assam, Meghalaya, and Manipur "
                "for the next 48 hours."
            ),
            "priority": "high",
            "is_read": False,
        },
        {
            "user_id": users[2].id,  # rescue team
            "type": "deployment",
            "title": "Team Deployment Order — Ernakulam",
            "message": (
                "NDRF 5th Bn is ordered to deploy immediately to Ernakulam for flood rescue ops. "
                "Report to District Collector Office, MG Road by 0600 hrs. Equipment manifest attached."
            ),
            "priority": "critical",
            "is_read": True,
        },
        {
            "user_id": None,
            "type": "info",
            "title": "Sikkim GLOF Update — Search Operations Ongoing",
            "message": (
                "Army teams are still searching for 40 missing personnel in the Teesta Valley. "
                "4 bridges washed away on NH-10. Alternate route via Kalimpong is operational."
            ),
            "priority": "high",
            "is_read": False,
        },
        {
            "user_id": None,
            "type": "resolve",
            "title": "✅ Mumbai Floods Situation Improving",
            "message": (
                "Water levels in Sion, Kurla, and Hindmata have receded. Mumbai's local train "
                "service has resumed on Western and Harbour lines. Civic workers clearing debris."
            ),
            "priority": "normal",
            "is_read": True,
        },
    ]

    for n in notifications_data:
        notif = models.Notification(**n, created_at=_ago(hours=random.randint(1, 48)))
        db.add(notif)
    db.flush()

    # -----------------------------------------------------------------------
    # Predictions
    # -----------------------------------------------------------------------
    predictions_data = [
        {
            "disaster_type": "flood",
            "location_name": "Patna, Bihar",
            "latitude": 25.5941,
            "longitude": 85.1376,
            "risk_level": models.RiskLevel.high,
            "confidence_score": 0.87,
            "details": (
                "Satellite imagery and river gauge data indicate Ganges water levels at Patna "
                "are 94% of danger mark. With 2 more days of IMD-predicted heavy rainfall, "
                "probability of flooding in low-lying areas is 87%. Recommend pre-emptive "
                "evacuation of Gandhi Ghat and Danapur riverfront settlements."
            ),
            "predicted_at": _ago(hours=6),
        },
        {
            "disaster_type": "cyclone",
            "location_name": "Visakhapatnam, Andhra Pradesh",
            "latitude": 17.6868,
            "longitude": 83.2185,
            "risk_level": models.RiskLevel.moderate,
            "confidence_score": 0.72,
            "details": (
                "Bay of Bengal SST anomaly of +1.8°C detected. A low-pressure system is "
                "likely to intensify into a cyclonic storm within 72 hours. Track models "
                "suggest 60% probability of landfall between Vizag and Kakinada. "
                "Fisher folk advised not to venture into deep sea."
            ),
            "predicted_at": _ago(hours=12),
        },
        {
            "disaster_type": "landslide",
            "location_name": "Darjeeling, West Bengal",
            "latitude": 27.0360,
            "longitude": 88.2627,
            "risk_level": models.RiskLevel.extreme,
            "confidence_score": 0.91,
            "details": (
                "Slope stability analysis using InSAR data shows active ground deformation of "
                "4.2 cm/month on the western slopes of Tiger Hill. Combined with 320mm rainfall "
                "in the past 72 hours, landslide probability in the next 24 hours is 91%. "
                "Evacuate Singtom Tea Estate and North Point areas immediately."
            ),
            "predicted_at": _ago(hours=3),
        },
        {
            "disaster_type": "earthquake",
            "location_name": "Shillong, Meghalaya",
            "latitude": 25.5788,
            "longitude": 91.8933,
            "risk_level": models.RiskLevel.moderate,
            "confidence_score": 0.65,
            "details": (
                "Seismic monitoring stations have recorded 8 micro-earthquakes (M2.0–3.5) "
                "along the Shillong Plateau Fault in the past 7 days. Historical seismicity "
                "patterns suggest elevated probability of a moderate event within 30 days. "
                "Recommend structural audit of old masonry buildings."
            ),
            "predicted_at": _ago(days=1),
        },
        {
            "disaster_type": "wildfire",
            "location_name": "Simlipal National Park, Odisha",
            "latitude": 21.6500,
            "longitude": 86.5500,
            "risk_level": models.RiskLevel.high,
            "confidence_score": 0.80,
            "details": (
                "MODIS satellite fire hotspot data shows active burning across 1,200 ha of "
                "the core tiger reserve area. Dry weather forecast for next 10 days with "
                "wind speeds 35–50 km/h. Fire spread probability to buffer zone villages is "
                "80%. Firebreaks and controlled burns recommended immediately."
            ),
            "predicted_at": _ago(hours=18),
        },
    ]

    for p in predictions_data:
        pred = models.Prediction(**p)
        db.add(pred)

    # -----------------------------------------------------------------------
    # Volunteer Tasks & Relief Distributions
    # -----------------------------------------------------------------------
    sample_incident = db.query(models.Incident).first()
    sample_resource = db.query(models.Resource).first()

    volunteer_tasks_data = [
        {
            "title": "Distribute food packets to Chennai flood victims",
            "description": "Help distribute cooked food packets and water bottles to stranded residents in low-lying parts of Tambaram.",
            "location": "Tambaram West Relief Center, Chennai",
            "required_skills": "Driving,Physical Labor,Local Language",
            "status": "open",
            "priority": models.SeverityLevel.high,
            "due_date": datetime.utcnow() + timedelta(days=2),
            "incident_id": sample_incident.id if sample_incident else None,
        },
        {
            "title": "First Aid Support at Nehru Stadium Shelter",
            "description": "Provide basic medical support, dressing, and health check assistance at the main relief shelter.",
            "location": "Nehru Stadium, Bhubaneswar, Odisha",
            "required_skills": "First Aid,Nursing,Empathy",
            "status": "open",
            "priority": models.SeverityLevel.critical,
            "due_date": datetime.utcnow() + timedelta(days=1),
            "incident_id": sample_incident.id if sample_incident else None,
        },
        {
            "title": "Help Pack Dry Ration Kits at Guwahati Warehouse",
            "description": "Sort and pack essential dry grains, pulses, oil, and hygiene supplies into family relief kits.",
            "location": "NDRF Hub Warehouse, Guwahati, Assam",
            "required_skills": "Packing,Sorting,Physical Labor",
            "status": "open",
            "priority": models.SeverityLevel.medium,
            "due_date": datetime.utcnow() + timedelta(days=5),
            "incident_id": None,
        }
    ]

    for t in volunteer_tasks_data:
        task = models.VolunteerTask(**t)
        db.add(task)

    if sample_resource:
        distributions_data = [
            {
                "resource_id": sample_resource.id,
                "quantity": 150.0,
                "distributed_to": "Tambaram West Shelter, Chennai",
                "incident_id": sample_incident.id if sample_incident else None,
                "status": "delivered",
            },
            {
                "resource_id": sample_resource.id,
                "quantity": 80.0,
                "distributed_to": "Puri Coastal Relief Center",
                "incident_id": None,
                "status": "delivered",
            }
        ]

        for d in distributions_data:
            dist = models.ReliefDistribution(**d)
            db.add(dist)

    db.commit()
    print("✅ Database seeded successfully with all disaster scenario data.")
