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

// ─── Auth API ────────────────────────────────────────────────────────────────
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

  changePassword: (old_password: string, new_password: string) =>
    api.put('/auth/change-password', { old_password, new_password }),

  updateProfile: (data: Partial<{ full_name: string; phone: string }>) =>
    api.put('/users/me', data),
}

// ─── Incidents API ───────────────────────────────────────────────────────────
export const incidentsAPI = {
  list: (params?: {
    skip?: number
    limit?: number
    status?: string
    type?: string
    severity?: string
  }) => api.get('/incidents/', { params }),

  get: (id: number) => api.get(`/incidents/${id}`),

  create: (data: {
    title: string
    type: string
    severity: string
    latitude: number
    longitude: number
    description?: string
    status?: string
  }) => api.post('/incidents/', data),

  update: (id: number, data: Partial<{
    title: string
    type: string
    severity: string
    status: string
    description: string
  }>) => api.put(`/incidents/${id}`, data),

  delete: (id: number) => api.delete(`/incidents/${id}`),
}

// ─── SOS API ─────────────────────────────────────────────────────────────────
export const sosAPI = {
  // Submit SOS as JSON (image handled separately via upload API)
  create: (data: {
    incident_type: string
    severity: string
    latitude: number
    longitude: number
    description?: string
    people_count: number
    medical_emergency: boolean
    image_url?: string
  }) => api.post('/sos/', data),

  list: (params?: { skip?: number; limit?: number; status?: string }) =>
    api.get('/sos/', { params }),

  get: (id: number) => api.get(`/sos/${id}`),

  updateStatus: (id: number, status: string) =>
    api.put(`/sos/${id}/status`, { status }),
}

// ─── Shelters API ────────────────────────────────────────────────────────────
export const sheltersAPI = {
  list: (params?: { skip?: number; limit?: number }) =>
    api.get('/shelters/', { params }),

  get: (id: number) => api.get(`/shelters/${id}`),

  create: (data: {
    name: string
    address: string
    latitude: number
    longitude: number
    capacity: number
    current_occupancy?: number
    contact?: string
    status?: string
  }) => api.post('/shelters/', data),

  update: (id: number, data: Partial<{
    name: string
    capacity: number
    current_occupancy: number
    status: string
    contact: string
  }>) => api.put(`/shelters/${id}`, data),
}

// ─── Resources API ───────────────────────────────────────────────────────────
export const resourcesAPI = {
  list: (params?: { category?: string; skip?: number; limit?: number }) =>
    api.get('/resources/', { params }),

  get: (id: number) => api.get(`/resources/${id}`),

  summary: () => api.get('/resources/summary'),

  create: (data: {
    name: string
    category: string
    quantity: number
    unit: string
    warehouse_location: string
  }) => api.post('/resources/', data),

  update: (id: number, data: Partial<{
    quantity: number
    warehouse_location: string
    name: string
  }>) => api.put(`/resources/${id}`, data),

  delete: (id: number) => api.delete(`/resources/${id}`),

  distribute: (data: {
    resource_id: number
    quantity: number
    distributed_to: string
    incident_id?: number
    status?: string
  }) => api.post('/resources/distribute', data),

  distributions: (params?: { incident_id?: number; skip?: number; limit?: number }) =>
    api.get('/resources/distributions', { params }),
}

// ─── Analytics API ───────────────────────────────────────────────────────────
export const analyticsAPI = {
  summary: () => api.get('/analytics/summary'),
  incidents: () => api.get('/analytics/incidents'),
  trends: () => api.get('/analytics/trends'),
  resources: () => api.get('/analytics/resources'),
}

// ─── Weather API ─────────────────────────────────────────────────────────────
export const weatherAPI = {
  // Returns mock weather for all 5 cities
  getAll: () => api.get('/weather/'),

  // Alias kept for backward compatibility
  get: (_city?: string) => api.get('/weather/'),
}

// ─── AI Predictions API ──────────────────────────────────────────────────────
export const predictionsAPI = {
  list: (params?: { risk_level?: string; type?: string }) =>
    api.get('/predictions/', { params }),

  // analyze uses QUERY PARAMS (not body) — matches backend signature
  analyze: (data: {
    location: string
    latitude: number
    longitude: number
    disaster_type?: string
  }) =>
    api.post('/predictions/analyze', null, {
      params: {
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        disaster_type: data.disaster_type ?? 'flood',
      },
    }),
}

// ─── Chatbot API ─────────────────────────────────────────────────────────────
export const chatbotAPI = {
  // Backend route: POST /api/chatbot/  body: { message: string }
  send: (message: string) => api.post('/chatbot/', { message }),

  // Emergency guide shortcut (maps to chatbot with predefined message)
  emergencyGuide: (disaster_type: string) =>
    api.post('/chatbot/', { message: `emergency guide for ${disaster_type}` }),
}

// ─── Notifications API ───────────────────────────────────────────────────────
export const notificationsAPI = {
  list: (params?: { skip?: number; limit?: number }) =>
    api.get('/notifications/', { params }),

  markRead: (id: number) => api.put(`/notifications/${id}/read`),

  create: (data: {
    title: string
    message: string
    type: string
    priority?: string
    user_id?: number
  }) => api.post('/notifications/', data),
}

// ─── Rescue Teams API ────────────────────────────────────────────────────────
export const rescueTeamsAPI = {
  // Backend prefix is /api/rescue/teams  (NOT /api/rescue-teams)
  list: (params?: { status?: string; skip?: number; limit?: number }) =>
    api.get('/rescue/teams', { params }),

  get: (id: number) => api.get(`/rescue/teams/${id}`),

  create: (data: {
    name: string
    latitude: number
    longitude: number
    members_count?: number
    specialization?: string
    status?: string
  }) => api.post('/rescue/teams', data),

  updateStatus: (id: number, new_status: string) =>
    api.put(`/rescue/teams/${id}/status`, null, {
      params: { status: new_status },
    }),

  assign: (teamId: number, incidentId: number) =>
    api.put(`/rescue/teams/${teamId}/assign`, null, {
      params: { incident_id: incidentId },
    }),

  unassign: (teamId: number) =>
    api.put(`/rescue/teams/${teamId}/unassign`),

  delete: (id: number) => api.delete(`/rescue/teams/${id}`),
}

// ─── Users API ───────────────────────────────────────────────────────────────
export const usersAPI = {
  list: (params?: { skip?: number; limit?: number }) =>
    api.get('/users/', { params }),

  get: (id: number) => api.get(`/users/${id}`),

  update: (id: number, data: Partial<{
    full_name: string
    phone: string
    role: string
    is_active: boolean
  }>) => api.put(`/users/${id}`, data),

  delete: (id: number) => api.delete(`/users/${id}`),
}

// ─── File Upload API ─────────────────────────────────────────────────────────
export const uploadsAPI = {
  uploadImage: async (file: File, folder = 'general') => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/uploads/image?folder=${folder}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  deleteImage: (filePath: string) =>
    api.delete('/uploads/image', { params: { file_path: filePath } }),
}

// ─── Volunteers API ──────────────────────────────────────────────────────────
export const volunteersAPI = {
  tasks: (params?: { status?: string; skip?: number; limit?: number }) =>
    api.get('/volunteers/tasks', { params }),

  acceptTask: (id: number) =>
    api.post(`/volunteers/tasks/${id}/accept`),

  completeTask: (id: number) =>
    api.post(`/volunteers/tasks/${id}/complete`),
}

// ─── Admin API ───────────────────────────────────────────────────────────────
export const adminAPI = {
  systemStats: () => api.get('/analytics/summary'),
}

export default api
