<h1 align="center">
  <img src="https://img.shields.io/badge/ResQAI-AI%20Disaster%20Response-00D4FF?style=for-the-badge&logo=shield&logoColor=white" alt="ResQAI" />
</h1>

<p align="center">
  <strong>AI-Powered Disaster Response Platform</strong><br />
  Predict disasters · Coordinate rescue · Optimize relief · Save lives
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

---

## 🚀 Overview

**ResQAI** is a production-ready, full-stack disaster response platform that leverages Artificial Intelligence to help governments, NGOs, rescue teams, and citizens respond faster and smarter during disasters.

### Key Capabilities

| Feature | Description |
|---|---|
| 🧠 **AI Disaster Prediction** | ML-powered risk assessment for floods, earthquakes, cyclones |
| 🆘 **SOS Emergency Reporting** | GPS-based emergency reporting with media upload |
| 🗺️ **Live Disaster Map** | Interactive Leaflet map with real-time incident markers |
| 🚁 **Rescue Coordination** | Team dispatch, route optimization, mission management |
| 📦 **Relief Distribution** | Inventory management and resource allocation |
| 🏠 **Shelter Locator** | Find nearby shelters with capacity info |
| 🤖 **AI Chat Assistant** | 24/7 emergency guidance chatbot |
| 📊 **Analytics Dashboard** | Incident trends, rescue stats, risk heatmaps |
| 🔔 **Real-time Alerts** | Push notifications for floods, cyclones, earthquakes |
| 👥 **Role-based Access** | 6 roles: Citizen, Admin, Rescue, Volunteer, NGO, Government |

---

## 🖥️ Tech Stack

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** — utility-first styling
- **Framer Motion** — smooth animations
- **React Router v6** — client-side routing
- **Leaflet** + **React Leaflet** — interactive maps
- **Chart.js** + **react-chartjs-2** — data visualization
- **Lucide React** — icon library
- **React Hot Toast** — notifications
- **Zustand** — state management
- **Axios** — HTTP client

### Backend
- **FastAPI** — high-performance Python API
- **SQLAlchemy 2.0** — ORM with async support
- **SQLite** (dev) / **PostgreSQL** (production)
- **Alembic** — database migrations
- **python-jose** — JWT authentication
- **Passlib + bcrypt** — password hashing
- **Pydantic v2** — data validation

### Infrastructure
- **Docker** + **Docker Compose** — containerization
- **Nginx** — reverse proxy + static file serving
- **Render** / **Vercel** — planned cloud deployment

---

## 📁 Project Structure

```
resqai/
├── frontend/                    # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── GlassCard.tsx
│   │   │   ├── AnimatedCounter.tsx
│   │   │   ├── SeverityBadge.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/               # Application pages
│   │   │   ├── LandingPage.tsx  # Public landing page
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── MapPage.tsx      # Live disaster map
│   │   │   ├── SOSPage.tsx      # Emergency reporting
│   │   │   ├── AIPage.tsx       # AI features hub
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── AdminPage.tsx
│   │   │   ├── RescuePage.tsx
│   │   │   ├── VolunteerPage.tsx
│   │   │   ├── ReliefPage.tsx
│   │   │   └── NotificationsPage.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # JWT auth state
│   │   ├── lib/
│   │   │   └── api.ts           # Axios API client
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── backend/                     # FastAPI + Python
│   ├── routes/
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── incidents.py
│   │   ├── sos.py
│   │   ├── shelters.py
│   │   ├── resources.py
│   │   ├── rescue.py
│   │   ├── notifications.py
│   │   ├── weather.py
│   │   ├── predictions.py
│   │   ├── chatbot.py
│   │   └── analytics.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── seed.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** 20+ and **npm**
- **Python** 3.11+
- **Git**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd resqai
```

### 2. Start the Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server (auto-seeds database on first run)
uvicorn main:app --reload --port 8000
```

Backend API: **http://localhost:8000**  
API Docs: **http://localhost:8000/docs**

### 3. Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend: **http://localhost:5173**

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@resqai.in | password123 |
| Rescue Team | rescue@resqai.in | password123 |
| Volunteer | volunteer@resqai.in | password123 |
| NGO | ngo@resqai.in | password123 |
| Government | govt@resqai.in | password123 |
| Citizen | citizen@resqai.in | password123 |

---

## 🐳 Docker Deployment

### Development with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services:
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8000
- **PostgreSQL**: localhost:5432

### 🚀 Deployment Status

> [!NOTE]
> **Active Development**
> ResQAI is currently in active development. The platform is being finalized and optimized for the final judging round.

- **Status**: Local development and Docker testing complete.
- **Production Infrastructure**:
  - **Backend**: Planned for deployment on **Render** (FastAPI Web Service).
  - **Frontend**: Planned for deployment on **Vercel** or **Render Static Sites** (React Single Page Application).
  - **Database**: **PostgreSQL** will be used as the production database cluster.
- **Timeline**: Deployment is scheduled to go live after **20 July 2026**.
- **Demo Links**: Live demo URLs and API endpoints will be added to this section once the deployment is complete.

---

## 🔌 API Reference

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Core Resources

```http
GET  /api/incidents          # List all incidents
POST /api/incidents          # Create incident
GET  /api/incidents/{id}     # Get incident

POST /api/sos                # Submit SOS report
GET  /api/sos                # List SOS reports

GET  /api/shelters           # List shelters
GET  /api/resources          # List resources
GET  /api/rescue/teams       # List rescue teams
```

### AI & Analytics

```http
POST /api/chatbot            # AI chat message
GET  /api/predictions        # Get AI predictions
POST /api/predictions/analyze # Analyze location risk
GET  /api/analytics/summary  # Dashboard summary
GET  /api/weather            # Weather alerts
```

Full interactive API docs available at `/docs` (Swagger UI) and `/redoc`.

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary Background | `#0B1220` |
| Secondary (Cyan) | `#00D4FF` |
| Accent (Blue) | `#3B82F6` |
| Success (Green) | `#22C55E` |
| Danger (Red) | `#EF4444` |
| Card Style | Glassmorphism |
| Border Radius | 16px |
| Font | Inter |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Users / Browser                   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│             Nginx (Port 80)                         │
│    Static files + Reverse proxy to /api             │
└──────────┬──────────────────────┬───────────────────┘
           │                      │
┌──────────▼────────┐  ┌──────────▼────────────────────┐
│  React 19 SPA     │  │   FastAPI Backend (Port 8000)  │
│  (dist/ served    │  │   - JWT Auth                   │
│   by Nginx)       │  │   - REST APIs                  │
│                   │  │   - AI Mock Services           │
└───────────────────┘  └──────────┬────────────────────┘
                                  │
                       ┌──────────▼────────────────────┐
                       │   SQLite (dev)                 │
                       │   PostgreSQL (production)       │
                       └───────────────────────────────┘
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with ❤️ for saving lives · ResQAI 2024
</p>
