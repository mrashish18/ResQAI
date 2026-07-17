import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Request interceptor: attach bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('resqai_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('resqai_token')
      localStorage.removeItem('resqai_user')
      delete axios.defaults.headers.common['Authorization']
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: {
    full_name: string
    email: string
    password: string
    role: string
    phone?: string
  }) => api.post('/auth/register', data),

  me: () => api.get('/auth/me'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),

  changePassword: (old_password: string, new_password: string) =>
    api.post('/auth/change-password', { old_password, new_password }),

  updateProfile: (data: Partial<{ full_name: string; phone: string }>) =>
    api.put('/auth/profile', data),
}

// Incidents API
export const incidentsAPI = {
  list: (params?: {
    page?: number
    size?: number
    status?: string
    type?: string
    severity?: string
  }) => api.get('/incidents', { params }),

  get: (id: number) => api.get(`/incidents/${id}`),

  create: (data: {
    title: string
    type: string
    severity: string
    latitude: number
    longitude: number
    description: string
  }) => api.post('/incidents', data),

  update: (id: number, data: Partial<{
    title: string
    type: string
    severity: string
    status: string
    description: string
  }>) => api.put(`/incidents/${id}`, data),

  delete: (id: number) => api.delete(`/incidents/${id}`),

  assignTeam: (incidentId: number, teamId: number) =>
    api.post(`/incidents/${incidentId}/assign-team`, { team_id: teamId }),

  nearby: (lat: number, lng: number, radius: number) =>
    api.get('/incidents/nearby', { params: { lat, lng, radius } }),
}

// SOS API
export const sosAPI = {
  create: (data: {
    incident_type: string
    severity: string
    latitude: number
    longitude: number
    description: string
    people_count: number
    medical_emergency: boolean
    image?: File
  }) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'image') {
        formData.append(key, String(value))
      }
    })
    if (data.image) formData.append('image', data.image)
    return api.post('/sos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  list: (params?: { page?: number; size?: number; status?: string }) =>
    api.get('/sos', { params }),

  get: (id: number) => api.get(`/sos/${id}`),

  updateStatus: (id: number, status: string) =>
    api.put(`/sos/${id}/status`, { status }),
}

// Shelters API
export const sheltersAPI = {
  list: (params?: { lat?: number; lng?: number; radius?: number; available?: boolean }) =>
    api.get('/shelters', { params }),

  get: (id: number) => api.get(`/shelters/${id}`),

  create: (data: {
    name: string
    address: string
    latitude: number
    longitude: number
    capacity: number
    contact: string
  }) => api.post('/shelters', data),

  update: (id: number, data: Partial<{
    name: string
    capacity: number
    current_occupancy: number
    status: string
    contact: string
  }>) => api.put(`/shelters/${id}`, data),

  updateOccupancy: (id: number, occupancy: number) =>
    api.put(`/shelters/${id}/occupancy`, { current_occupancy: occupancy }),
}

// Resources API
export const resourcesAPI = {
  list: (params?: { category?: string; page?: number; size?: number }) =>
    api.get('/resources', { params }),

  get: (id: number) => api.get(`/resources/${id}`),

  create: (data: {
    name: string
    category: string
    quantity: number
    unit: string
    warehouse_location: string
  }) => api.post('/resources', data),

  update: (id: number, data: Partial<{
    quantity: number
    warehouse_location: string
    threshold_quantity: number
  }>) => api.put(`/resources/${id}`, data),

  distribute: (data: {
    resource_id: number
    quantity: number
    distributed_to: string
    incident_id?: number
  }) => api.post('/resources/distribute', data),

  distributions: (params?: { page?: number; incident_id?: number }) =>
    api.get('/resources/distributions', { params }),
}

// Analytics API
export const analyticsAPI = {
  summary: () => api.get('/analytics/summary'),

  incidents: (params?: { start_date?: string; end_date?: string; type?: string }) =>
    api.get('/analytics/incidents', { params }),

  trends: (params?: { period?: string; type?: string }) =>
    api.get('/analytics/trends', { params }),

  resources: () => api.get('/analytics/resources'),

  response_times: () => api.get('/analytics/response-times'),

  heatmap: () => api.get('/analytics/heatmap'),

  volunteer: () => api.get('/analytics/volunteers'),
}

// Weather API
export const weatherAPI = {
  get: (city: string) => api.get('/weather', { params: { city } }),

  byCoords: (lat: number, lng: number) =>
    api.get('/weather/coords', { params: { lat, lng } }),

  alerts: () => api.get('/weather/alerts'),

  forecast: (city: string) => api.get('/weather/forecast', { params: { city } }),
}

// AI Predictions API
export const predictionsAPI = {
  list: (params?: { risk_level?: string; type?: string; page?: number }) =>
    api.get('/predictions', { params }),

  get: (id: number) => api.get(`/predictions/${id}`),

  analyze: (data: {
    location: string
    latitude: number
    longitude: number
    disaster_type?: string
  }) => api.post('/predictions/analyze', data),

  active: () => api.get('/predictions/active'),

  history: (params?: { page?: number; size?: number }) =>
    api.get('/predictions/history', { params }),
}

// Chatbot API
export const chatbotAPI = {
  send: (message: string, session_id?: string) =>
    api.post('/chatbot/message', { message, session_id }),

  history: (session_id: string) =>
    api.get(`/chatbot/history/${session_id}`),

  emergencyGuide: (disaster_type: string) =>
    api.get('/chatbot/emergency-guide', { params: { disaster_type } }),

  analyzeImage: (image: File) => {
    const formData = new FormData()
    formData.append('image', image)
    return api.post('/chatbot/analyze-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// Notifications API
export const notificationsAPI = {
  list: (params?: { is_read?: boolean; page?: number; size?: number }) =>
    api.get('/notifications', { params }),

  markRead: (id: number) => api.put(`/notifications/${id}/read`),

  markAllRead: () => api.put('/notifications/mark-all-read'),

  delete: (id: number) => api.delete(`/notifications/${id}`),

  count: () => api.get('/notifications/unread-count'),

  preferences: () => api.get('/notifications/preferences'),

  updatePreferences: (data: Record<string, boolean>) =>
    api.put('/notifications/preferences', data),
}

// Rescue Teams API
export const rescueTeamsAPI = {
  list: (params?: { status?: string; page?: number }) =>
    api.get('/rescue-teams', { params }),

  get: (id: number) => api.get(`/rescue-teams/${id}`),

  create: (data: {
    name: string
    specialization: string
    members_count: number
    contact: string
  }) => api.post('/rescue-teams', data),

  update: (id: number, data: Partial<{
    status: string
    latitude: number
    longitude: number
    assigned_incident_id: number
  }>) => api.put(`/rescue-teams/${id}`, data),

  updateLocation: (id: number, lat: number, lng: number) =>
    api.put(`/rescue-teams/${id}/location`, { latitude: lat, longitude: lng }),
}

// Volunteers API
export const volunteersAPI = {
  list: (params?: { status?: string; page?: number }) =>
    api.get('/volunteers', { params }),

  register: (data: {
    skills: string[]
    availability: string
    location: string
  }) => api.post('/volunteers/register', data),

  tasks: (params?: { status?: string; page?: number }) =>
    api.get('/volunteers/tasks', { params }),

  acceptTask: (taskId: number) =>
    api.post(`/volunteers/tasks/${taskId}/accept`),

  completeTask: (taskId: number, notes?: string) =>
    api.post(`/volunteers/tasks/${taskId}/complete`, { notes }),

  createTask: (data: {
    title: string
    description: string
    location: string
    required_skills: string[]
    priority: string
    due_date?: string
    incident_id?: number
  }) => api.post('/volunteers/tasks', data),
}

// Admin API
export const adminAPI = {
  users: (params?: { role?: string; page?: number; size?: number }) =>
    api.get('/admin/users', { params }),

  updateUser: (id: number, data: Partial<{
    role: string
    is_active: boolean
  }>) => api.put(`/admin/users/${id}`, data),

  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),

  systemStats: () => api.get('/admin/stats'),

  logs: (params?: { page?: number; type?: string }) =>
    api.get('/admin/logs', { params }),

  config: () => api.get('/admin/config'),

  updateConfig: (data: Record<string, unknown>) =>
    api.put('/admin/config', data),
}

export default api
