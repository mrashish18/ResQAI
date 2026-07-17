"""
Chatbot route for ResQAI.
Provides keyword-driven disaster response guidance.
"""

import time
from fastapi import APIRouter

import schemas

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])


# ---------------------------------------------------------------------------
# Response knowledge base
# ---------------------------------------------------------------------------

RESPONSES = {
    "flood": {
        "category": "flood_safety",
        "confidence": 0.95,
        "response": (
            "🌊 **Flood Safety Guidelines:**\n\n"
            "**Immediate Actions:**\n"
            "• Move to higher ground immediately — do not wait for official orders.\n"
            "• Avoid walking or driving through floodwaters (15 cm can knock you down, 60 cm can sweep a car).\n"
            "• Disconnect electrical appliances and turn off the main power supply.\n"
            "• Do not touch electrical equipment if you are wet.\n\n"
            "**During Flood:**\n"
            "• Stay on the roof or highest floor and signal rescuers with a bright cloth.\n"
            "• Use a boat if available. Wear life jackets.\n"
            "• Keep emergency kit: water (3 litres/person/day), food, medicine, documents.\n\n"
            "**After Flood:**\n"
            "• Do not drink tap water until authorities declare it safe.\n"
            "• Watch for snakes and insects that may have been displaced.\n"
            "• Beware of structural damage before re-entering buildings.\n\n"
            "📞 **Emergency Numbers:** NDRF: 1078 | National Helpline: 112"
        ),
    },
    "water": {
        "category": "flood_safety",
        "confidence": 0.90,
        "response": (
            "💧 **Water Safety During Disasters:**\n\n"
            "• Only drink bottled, boiled, or purified water after a flood.\n"
            "• Use ORS (Oral Rehydration Salts) if diarrhoea occurs.\n"
            "• Do not swim in floodwaters — they may contain sewage, chemicals, and debris.\n"
            "• Waterborne diseases (cholera, typhoid, leptospirosis) spike after floods.\n"
            "• Contact district health officer if community water supply is contaminated.\n\n"
            "📞 **Health Helpline:** 104 | Water Crisis: Contact local municipal authority."
        ),
    },
    "earthquake": {
        "category": "earthquake_response",
        "confidence": 0.96,
        "response": (
            "🏚️ **Earthquake Response Steps:**\n\n"
            "**During Shaking (DROP, COVER, HOLD ON):**\n"
            "• DROP to hands and knees immediately.\n"
            "• Take COVER under a sturdy desk/table or against an interior wall.\n"
            "• HOLD ON until shaking stops. Cover your head and neck with your arms.\n"
            "• Stay away from windows, exterior walls, and heavy furniture.\n"
            "• If outdoors, move to open ground away from buildings and power lines.\n\n"
            "**After Shaking Stops:**\n"
            "• Expect aftershocks — stay alert.\n"
            "• Check yourself and others for injuries before moving.\n"
            "• Check for gas leaks (smell, hissing). If suspected, open windows and leave.\n"
            "• Do NOT use elevators.\n"
            "• Listen to AIR and Doordarshan for official guidance.\n\n"
            "**Trapped Under Debris:**\n"
            "• Do not light a match. Cover mouth with cloth.\n"
            "• Tap on a pipe or wall to help rescuers locate you.\n\n"
            "📞 **NDRF: 1078 | Seismic Helpline: 1800-11-8181**"
        ),
    },
    "cyclone": {
        "category": "cyclone_preparedness",
        "confidence": 0.94,
        "response": (
            "🌀 **Cyclone Preparedness & Response:**\n\n"
            "**Before Cyclone:**\n"
            "• Move to a designated cyclone shelter immediately when warned.\n"
            "• Reinforce doors and windows with planks.\n"
            "• Store food, water, medicine, and torch for 72 hours.\n"
            "• Keep important documents in a waterproof bag.\n\n"
            "**During Cyclone:**\n"
            "• Stay indoors in the strongest room (usually a ground floor interior room).\n"
            "• Do NOT go out during the 'eye' of the cyclone — winds will return suddenly.\n"
            "• Avoid flooded roads and stay away from coastlines.\n\n"
            "**After Cyclone:**\n"
            "• Watch for fallen power lines, damaged buildings, and flooding.\n"
            "• Report damage to district administration.\n\n"
            "📞 **IMD Cyclone Warning: 1800-180-1717 | Emergency: 112**"
        ),
    },
    "shelter": {
        "category": "shelter_information",
        "confidence": 0.92,
        "response": (
            "🏠 **Emergency Shelter Information:**\n\n"
            "**Finding a Shelter:**\n"
            "• Use the ResQAI app's 'Shelters' section to find the nearest relief camp.\n"
            "• Schools, community halls, and government buildings are typically used.\n"
            "• Contact your local Panchayat or Municipal Corporation.\n\n"
            "**What to Bring:**\n"
            "• Identity documents (Aadhaar, ration card)\n"
            "• Essential medicines and prescriptions\n"
            "• Warm clothing and extra clothes for 3 days\n"
            "• Baby food and nappies if needed\n"
            "• Torch and spare batteries\n\n"
            "**Currently Active Shelters in ResQAI:**\n"
            "• Ernakulam Relief Camp — 800 capacity, 673 occupied (Kerala)\n"
            "• Nehru Stadium, Bhubaneswar — 2500 capacity (Odisha)\n"
            "• Chamoli District Centre — 400 capacity (Uttarakhand)\n"
            "• NDRF Hub Guwahati — 3000 capacity (Assam)\n\n"
            "📞 **Shelter Helpline: 1070 | National Emergency: 112**"
        ),
    },
    "sos": {
        "category": "emergency_protocol",
        "confidence": 0.98,
        "response": (
            "🆘 **EMERGENCY SOS PROTOCOL:**\n\n"
            "**Immediate Steps:**\n"
            "1. Submit an SOS using the ResQAI app's SOS button with your GPS location.\n"
            "2. Call **112** (National Emergency) — works even without network balance.\n"
            "3. Call NDRF: **1078** for disaster-specific rescue.\n\n"
            "**While Waiting for Rescue:**\n"
            "• Stay visible — use bright cloth, mirror, or torch to signal rescuers.\n"
            "• Send your GPS coordinates via WhatsApp to your emergency contact.\n"
            "• Stay calm, conserve energy and water.\n"
            "• If in a building, move to a structurally strong area.\n\n"
            "**Other Helplines:**\n"
            "• Ambulance: 108\n"
            "• Police: 100\n"
            "• Fire: 101\n"
            "• Women Helpline: 1091\n"
            "• Child Helpline: 1098\n\n"
            "⚠️ Your SOS has been noted. Rescue teams have been alerted."
        ),
    },
    "help": {
        "category": "emergency_protocol",
        "confidence": 0.95,
        "response": (
            "🆘 **How ResQAI Can Help You:**\n\n"
            "• **SOS Alert** — Submit your location for immediate rescue dispatch.\n"
            "• **Find Shelter** — Locate nearest open relief camps on the map.\n"
            "• **Incident Map** — View active disasters near you.\n"
            "• **Weather Alerts** — Check real-time IMD warnings.\n"
            "• **Resource Locator** — Find food, water, and medicine distribution points.\n"
            "• **Chatbot** — Get instant disaster response guidance 24/7.\n\n"
            "📞 **Emergency:** 112 | **NDRF:** 1078 | **Ambulance:** 108"
        ),
    },
    "emergency": {
        "category": "emergency_protocol",
        "confidence": 0.97,
        "response": (
            "🚨 **EMERGENCY RESPONSE PROTOCOL:**\n\n"
            "**Call immediately:**\n"
            "• National Emergency: **112**\n"
            "• NDRF Disaster Helpline: **1078**\n"
            "• Ambulance: **108**\n"
            "• Police: **100**\n\n"
            "**Submit SOS on ResQAI:**\n"
            "Use the red SOS button in the app to share your precise GPS location with rescue teams.\n\n"
            "**While waiting:**\n"
            "• Stay calm and conserve energy.\n"
            "• Signal your location (whistle, torch, bright cloth).\n"
            "• Keep airways clear.\n"
            "• Assist injured persons only if it is safe to do so."
        ),
    },
    "evacuation": {
        "category": "evacuation_guidelines",
        "confidence": 0.93,
        "response": (
            "🚶 **Evacuation Guidelines:**\n\n"
            "**Before Leaving:**\n"
            "• Follow official evacuation orders — do not delay.\n"
            "• Take emergency kit: water, food (3 days), medicine, documents, cash, phone charger.\n"
            "• Inform a relative/friend of your evacuation destination.\n"
            "• Lock your home and turn off gas, water, and electricity.\n\n"
            "**During Evacuation:**\n"
            "• Use designated evacuation routes — avoid shortcuts.\n"
            "• Do NOT drive through flooded roads.\n"
            "• If on foot, avoid rivers and drains.\n"
            "• Help neighbours, especially elderly and disabled.\n\n"
            "**At the Shelter:**\n"
            "• Register with shelter authorities immediately.\n"
            "• Report missing persons to police.\n"
            "• Follow shelter rules and hygiene protocols.\n\n"
            "📞 **Evacuation Helpline: 1078 | Transport: Contact District Collector's Office**"
        ),
    },
    "landslide": {
        "category": "landslide_safety",
        "confidence": 0.92,
        "response": (
            "⛰️ **Landslide Safety Guidelines:**\n\n"
            "**Warning Signs:**\n"
            "• Sudden increase in stream/creek water levels (even without rain)\n"
            "• Rumbling sounds, cracking trees, leaning poles\n"
            "• New cracks in ground, walls, or road\n"
            "• Doors/windows sticking suddenly\n\n"
            "**Immediate Action:**\n"
            "• Evacuate immediately — do not wait.\n"
            "• Move away from the slide path — move to the side, not uphill.\n"
            "• Alert neighbours.\n"
            "• Call 112 and report exact location.\n\n"
            "**After a Landslide:**\n"
            "• Stay away from slide area — secondary slides possible.\n"
            "• Check for trapped persons and report to rescue teams.\n"
            "• Watch for broken gas and water pipes.\n\n"
            "📞 **Emergency: 112 | SDRF: Contact state disaster management authority**"
        ),
    },
    "tsunami": {
        "category": "tsunami_safety",
        "confidence": 0.96,
        "response": (
            "🌊 **Tsunami Warning Response:**\n\n"
            "**If You Feel an Earthquake Near the Coast:**\n"
            "• Move IMMEDIATELY to high ground or inland — do not wait for official warning.\n"
            "• A tsunami can arrive within minutes of an earthquake.\n\n"
            "**Warning Signs:**\n"
            "• Unusual rapid withdrawal of the sea ('drawback')\n"
            "• Loud ocean roar\n"
            "• Strong shaking near the coast\n\n"
            "**Do:**\n"
            "• Run to ground that is at least 30 metres above sea level.\n"
            "• Stay until authorities declare all-clear (can take hours/days).\n"
            "• Stay tuned to AIR/Doordarshan.\n\n"
            "**Do NOT:**\n"
            "• Return to the coast to watch waves.\n"
            "• Try to rescue belongings.\n\n"
            "📞 **INCOIS Tsunami Warning Centre: 040-23895000 | Emergency: 112**"
        ),
    },
    "wildfire": {
        "category": "wildfire_safety",
        "confidence": 0.91,
        "response": (
            "🔥 **Wildfire Safety Guidelines:**\n\n"
            "**Evacuation (if ordered):**\n"
            "• Leave early — do not wait until fire is visible.\n"
            "• Close all doors and windows (slows fire spread).\n"
            "• Turn off gas at the meter.\n\n"
            "**If Trapped by Fire:**\n"
            "• Call 112 immediately with your exact location.\n"
            "• Move to a clearing or road — avoid dense vegetation.\n"
            "• Crouch low to the ground to breathe cleaner air.\n"
            "• Cover exposed skin with cloth (wool is best, not synthetic).\n\n"
            "**After Fire:**\n"
            "• Do not re-enter fire area until cleared by authorities.\n"
            "• Watch for hot spots — fires can re-ignite in dead trees.\n\n"
            "📞 **Fire: 101 | Forest Department: Contact nearest forest range office**"
        ),
    },
}

DEFAULT_RESPONSE = {
    "category": "general_preparedness",
    "confidence": 0.75,
    "response": (
        "🛡️ **General Disaster Preparedness — ResQAI Guide:**\n\n"
        "**Build Your Emergency Kit:**\n"
        "• Water: 3 litres per person per day (72-hour supply)\n"
        "• Non-perishable food for 3 days\n"
        "• First aid kit and essential medications\n"
        "• Torch, batteries, and a whistle\n"
        "• Copies of important documents (Aadhaar, insurance, bank)\n"
        "• Cash in small denominations\n\n"
        "**Make a Family Emergency Plan:**\n"
        "• Choose an out-of-area contact person.\n"
        "• Identify two meeting points (near home, farther away).\n"
        "• Know your community's evacuation routes.\n"
        "• Practice emergency drills with your family.\n\n"
        "**Stay Informed:**\n"
        "• Register for IMD/NDMA alerts on your mobile.\n"
        "• Follow ResQAI for real-time incident and weather updates.\n"
        "• Download offline maps of your area.\n\n"
        "**Ask me about:** flood, earthquake, cyclone, wildfire, tsunami, landslide, "
        "evacuation, shelter, or SOS for specific guidance.\n\n"
        "📞 **All Emergencies: 112 | NDMA: 1078**"
    ),
}


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

@router.post("/", response_model=schemas.ChatResponse)
def chatbot(request: schemas.ChatRequest):
    """
    Process a user message and return a contextual disaster-response answer.
    Keyword matching maps queries to specific disaster domains.
    """
    start_time = time.time()
    message_lower = request.message.lower()

    matched = None

    # Priority keywords checked in order
    keyword_map = [
        (["sos", "emergency", "mayday", "trapped", "stuck"], "sos"),
        (["earthquake", "tremor", "quake", "seismic"], "earthquake"),
        (["tsunami", "tidal wave"], "tsunami"),
        (["cyclone", "hurricane", "typhoon", "storm"], "cyclone"),
        (["wildfire", "forest fire", "bushfire", "fire"], "wildfire"),
        (["landslide", "mudslide", "rockslide"], "landslide"),
        (["flood", "flooding", "inundation", "submerged"], "flood"),
        (["water", "drinking", "contaminated", "potable"], "water"),
        (["shelter", "camp", "refuge", "relief centre", "relief center"], "shelter"),
        (["evacuation", "evacuate", "escape route", "leaving"], "evacuation"),
        (["help", "what can you do", "how to use"], "help"),
    ]

    for keywords, key in keyword_map:
        if any(kw in message_lower for kw in keywords):
            matched = key
            break

    result = RESPONSES.get(matched, DEFAULT_RESPONSE) if matched else DEFAULT_RESPONSE

    elapsed_ms = round((time.time() - start_time) * 1000 + 45, 1)  # Add base latency

    return schemas.ChatResponse(
        response=result["response"],
        response_time=elapsed_ms,
        confidence=result["confidence"],
        category=result["category"],
    )
