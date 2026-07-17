export type UserRole = 'citizen' | 'admin' | 'rescue_team' | 'volunteer' | 'ngo' | 'government'
export type IncidentType = 'flood' | 'earthquake' | 'cyclone' | 'wildfire' | 'tsunami' | 'landslide' | 'other'
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical'
export type IncidentStatus = 'active' | 'resolved' | 'monitoring'
export type RiskLevel = 'low' | 'moderate' | 'high' | 'extreme'

export interface User {
  id: number
  email: string
  full_name: string
  role: UserRole
  phone?: string
  is_active: boolean
  created_at: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  full_name: string
  email: string
  password: string
  role: UserRole
  phone?: string
}

export interface Incident {
  id: number
  title: string
  type: IncidentType
  severity: SeverityLevel
  latitude: number
  longitude: number
  description: string
  status: IncidentStatus
  reporter_id: number
  created_at: string
  updated_at?: string
  affected_area?: string
  casualties?: number
  rescue_teams?: RescueTeam[]
}

export interface SOSReport {
  id: number
  user_id: number
  incident_type: string
  severity: SeverityLevel
  latitude: number
  longitude: number
  description: string
  people_count: number
  medical_emergency: boolean
  image_url?: string
  status: string
  created_at: string
  updated_at?: string
}

export interface Shelter {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
  capacity: number
  current_occupancy: number
  contact: string
  status: string
  amenities?: string[]
  is_accessible?: boolean
}

export interface RescueTeam {
  id: number
  name: string
  status: string
  latitude: number
  longitude: number
  members_count: number
  specialization: string
  assigned_incident_id?: number
  contact?: string
  equipment?: string[]
}

export interface Resource {
  id: number
  name: string
  category: string
  quantity: number
  unit: string
  warehouse_location: string
  last_updated?: string
  threshold_quantity?: number
}

export interface Notification {
  id: number
  type: string
  title: string
  message: string
  is_read: boolean
  priority: string
  created_at: string
  link?: string
}

export interface Prediction {
  id: number
  disaster_type: string
  location_name: string
  latitude: number
  longitude: number
  risk_level: RiskLevel
  confidence_score: number
  predicted_at: string
  details: string
  affected_radius_km?: number
  recommended_actions?: string[]
}

export interface WeatherData {
  city: string
  temperature: number
  humidity: number
  wind_speed: number
  condition: string
  alerts: string[]
  risk_level: string
  pressure?: number
  visibility?: number
  feels_like?: number
}

export interface AnalyticsSummary {
  total_incidents: number
  active_incidents: number
  resolved_incidents: number
  people_rescued: number
  shelters_available: number
  rescue_teams_deployed: number
  volunteers_active: number
  resources_distributed?: number
  response_time_avg?: number
}

export interface IncidentTrend {
  date: string
  count: number
  type: IncidentType
}

export interface ResourceTrend {
  resource: string
  used: number
  available: number
  category: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  sources?: string[]
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  created_at: string
}

export interface MapMarker {
  id: string
  type: 'incident' | 'shelter' | 'rescue' | 'sos' | 'prediction'
  latitude: number
  longitude: number
  data: Incident | Shelter | RescueTeam | SOSReport | Prediction
}

export interface AlertLevel {
  level: 'green' | 'yellow' | 'orange' | 'red'
  label: string
  description: string
}

export interface ReliefDistribution {
  id: number
  resource_id: number
  resource_name: string
  quantity: number
  distributed_to: string
  distributed_at: string
  coordinator_id: number
  incident_id?: number
  status: string
}

export interface VolunteerTask {
  id: number
  title: string
  description: string
  location: string
  required_skills: string[]
  assigned_to?: number
  incident_id?: number
  status: string
  priority: SeverityLevel
  due_date?: string
  created_at: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  status: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}
