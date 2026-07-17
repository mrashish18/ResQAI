"""
Comprehensive API validation test for ResQAI backend.
Tests all major endpoints to ensure they return expected status codes.
All collection routes use trailing slash (matching FastAPI's route definitions).
"""

import sys
import time
import httpx

base = 'http://127.0.0.1:8000'
results = []
errors = []

def test(label, status_code, expected=200):
    icon = "[PASS]" if status_code == expected else "[FAIL]"
    results.append(f"{icon} {label} -> {status_code} (expected {expected})")
    if status_code != expected:
        errors.append(label)

# -------------------------------------------------------------------------
# Public endpoints
# -------------------------------------------------------------------------
r = httpx.get(f'{base}/')
test("GET /", r.status_code)

r = httpx.get(f'{base}/health')
test("GET /health", r.status_code)

r = httpx.get(f'{base}/api/incidents/')
test("GET /api/incidents/", r.status_code)

r = httpx.get(f'{base}/api/shelters/')
test("GET /api/shelters/", r.status_code)

r = httpx.get(f'{base}/api/resources/')
test("GET /api/resources/", r.status_code)

r = httpx.get(f'{base}/api/resources/summary')
test("GET /api/resources/summary", r.status_code)

r = httpx.get(f'{base}/api/rescue/teams')
test("GET /api/rescue/teams", r.status_code)

r = httpx.get(f'{base}/api/weather/')
test("GET /api/weather/", r.status_code)

r = httpx.get(f'{base}/api/predictions/')
test("GET /api/predictions/", r.status_code)

r = httpx.get(f'{base}/api/analytics/summary')
test("GET /api/analytics/summary", r.status_code)

r = httpx.get(f'{base}/api/analytics/trends')
test("GET /api/analytics/trends", r.status_code)

r = httpx.get(f'{base}/api/analytics/incidents')
test("GET /api/analytics/incidents", r.status_code)

r = httpx.get(f'{base}/api/analytics/resources')
test("GET /api/analytics/resources", r.status_code)

r = httpx.post(f'{base}/api/chatbot/', json={'message': 'What should I do during a flood?'})
test("POST /api/chatbot/ (flood)", r.status_code)
if r.status_code == 200:
    assert r.json().get("category"), "chatbot response missing category"
    results[-1] += f" | category={r.json()['category']}"

# -------------------------------------------------------------------------
# Auth
# -------------------------------------------------------------------------
r = httpx.post(f'{base}/api/auth/login', json={'email': 'admin@resqai.in', 'password': 'password123'})
test("POST /api/auth/login (admin)", r.status_code)
admin_token = r.json().get('access_token', '')
admin_headers = {'Authorization': f'Bearer {admin_token}'}

r = httpx.post(f'{base}/api/auth/login', json={'email': 'citizen@resqai.in', 'password': 'password123'})
test("POST /api/auth/login (citizen)", r.status_code)
citizen_token = r.json().get('access_token', '')
citizen_headers = {'Authorization': f'Bearer {citizen_token}'}

r = httpx.get(f'{base}/api/auth/me', headers=admin_headers)
test("GET /api/auth/me", r.status_code)
if r.status_code == 200:
    results[-1] += f" | role={r.json()['role']}"

# Change password with wrong old password → should get 400
r = httpx.put(
    f'{base}/api/auth/change-password',
    json={'old_password': 'wrongpassword', 'new_password': 'newpass123'},
    headers=citizen_headers,
)
test("PUT /api/auth/change-password (wrong pw)", r.status_code, expected=400)

# Register new user — use a unique email per test run
unique_email = f"testuser{int(time.time())}@resqai.in"
r = httpx.post(f'{base}/api/auth/register', json={
    'email': unique_email,
    'full_name': 'Test User Registration',
    'password': 'password123',
    'role': 'volunteer',
})
test("POST /api/auth/register", r.status_code, expected=201)

# -------------------------------------------------------------------------
# Authenticated endpoints
# -------------------------------------------------------------------------
r = httpx.get(f'{base}/api/sos/', headers=admin_headers)
test("GET /api/sos/", r.status_code)
if r.status_code == 200:
    results[-1] += f" | count={len(r.json())}"

r = httpx.get(f'{base}/api/notifications/', headers=admin_headers)
test("GET /api/notifications/", r.status_code)
if r.status_code == 200:
    results[-1] += f" | count={len(r.json())}"

r = httpx.get(f'{base}/api/users/', headers=admin_headers)
test("GET /api/users/ (admin)", r.status_code)
if r.status_code == 200:
    results[-1] += f" | count={len(r.json())}"

# -------------------------------------------------------------------------
# Create operations
# -------------------------------------------------------------------------
r = httpx.post(
    f'{base}/api/incidents/',
    json={
        'title': 'Test Flash Flood in Nashik',
        'type': 'flood',
        'severity': 'high',
        'latitude': 20.00,
        'longitude': 73.79,
        'description': 'Test incident for API validation.',
        'status': 'active',
    },
    headers=citizen_headers,
)
test("POST /api/incidents/ (create incident)", r.status_code, expected=201)

r = httpx.post(
    f'{base}/api/sos/',
    json={
        'incident_type': 'flood',
        'severity': 'high',
        'latitude': 20.00,
        'longitude': 73.79,
        'description': 'Test SOS report.',
        'people_count': 5,
        'medical_emergency': True,
    },
    headers=citizen_headers,
)
test("POST /api/sos/ (submit SOS)", r.status_code, expected=201)
sos_id = r.json().get('id') if r.status_code == 201 else None

if sos_id:
    r = httpx.put(
        f'{base}/api/sos/{sos_id}/status',
        json={'status': 'acknowledged'},
        headers=admin_headers,
    )
    test(f"PUT /api/sos/{sos_id}/status (acknowledge)", r.status_code)

r = httpx.post(
    f'{base}/api/rescue/teams',
    json={
        'name': 'API Test Team Delta',
        'latitude': 28.63,
        'longitude': 77.21,
        'members_count': 35,
        'specialization': 'Urban Search and Rescue',
    },
    headers=admin_headers,
)
test("POST /api/rescue/teams (create team)", r.status_code, expected=201)
new_team_id = r.json().get('id') if r.status_code == 201 else None

r = httpx.post(
    f'{base}/api/resources/',
    json={
        'name': 'API Test Blankets',
        'category': 'blankets',
        'quantity': 500,
        'unit': 'pieces',
        'warehouse_location': 'Test Warehouse, Delhi',
    },
    headers=admin_headers,
)
test("POST /api/resources/ (create resource)", r.status_code, expected=201)

r = httpx.post(
    f'{base}/api/predictions/analyze',
    params={
        'location': 'Test City',
        'disaster_type': 'earthquake',
        'latitude': 28.63,
        'longitude': 77.21,
    },
)
test("POST /api/predictions/analyze", r.status_code)

r = httpx.post(
    f'{base}/api/shelters/',
    json={
        'name': 'API Test Shelter',
        'address': '123 Test Street, Delhi 110001',
        'latitude': 28.63,
        'longitude': 77.21,
        'capacity': 200,
        'current_occupancy': 0,
        'contact': '+91-11-12345678',
    },
    headers=admin_headers,
)
test("POST /api/shelters/ (create shelter)", r.status_code, expected=201)

# -------------------------------------------------------------------------
# Volunteer and Distribution endpoints
# -------------------------------------------------------------------------
r = httpx.get(f'{base}/api/volunteers/tasks', headers=admin_headers)
test("GET /api/volunteers/tasks", r.status_code)
if r.status_code == 200:
    results[-1] += f" | count={len(r.json())}"

r = httpx.post(
    f'{base}/api/volunteers/tasks',
    json={
        'title': 'Test Volunteer Task',
        'description': 'Deliver clean water to the neighborhood.',
        'location': 'Test Block A, Delhi',
        'required_skills': ['driving', 'physical labor'],
        'priority': 'high',
    },
    headers=admin_headers,
)
test("POST /api/volunteers/tasks (create task)", r.status_code, expected=201)
task_id = r.json().get('id') if r.status_code == 201 else None

if task_id:
    r = httpx.post(f'{base}/api/volunteers/tasks/{task_id}/accept', headers=citizen_headers)
    test("POST /api/volunteers/tasks/{id}/accept (citizen unauthorized)", r.status_code, expected=403)

    r = httpx.post(f'{base}/api/volunteers/tasks/{task_id}/accept', headers=admin_headers)
    test("POST /api/volunteers/tasks/{id}/accept (admin accept)", r.status_code)

    r = httpx.post(f'{base}/api/volunteers/tasks/{task_id}/complete', headers=admin_headers)
    test("POST /api/volunteers/tasks/{id}/complete", r.status_code)

# Distribution tests
r = httpx.post(
    f'{base}/api/resources/distribute',
    json={
        'resource_id': 1,
        'quantity': 1.0,
        'distributed_to': 'Main Shelter',
        'status': 'delivered',
    },
    headers=admin_headers,
)
test("POST /api/resources/distribute", r.status_code, expected=201)

r = httpx.get(f'{base}/api/resources/distributions')
test("GET /api/resources/distributions", r.status_code)
if r.status_code == 200:
    results[-1] += f" | count={len(r.json())}"


# -------------------------------------------------------------------------
# Summary
# -------------------------------------------------------------------------
print("\nRESQAI BACKEND — API TEST RESULTS")
print("=" * 60)
for line in results:
    print(line)
print("=" * 60)
total = len(results)
passed = total - len(errors)
print(f"\n{passed}/{total} tests passed")
if errors:
    print(f"\nFailed: {', '.join(errors)}")
    sys.exit(1)
else:
    print("\nAll tests passed!")
