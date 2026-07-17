import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

// Eagerly-loaded auth/public pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Lazy-loaded protected pages for code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const MapPage = lazy(() => import('./pages/MapPage'))
const SOSPage = lazy(() => import('./pages/SOSPage'))
const AIPage = lazy(() => import('./pages/AIPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const RescuePage = lazy(() => import('./pages/RescuePage'))
const VolunteerPage = lazy(() => import('./pages/VolunteerPage'))
const ReliefPage = lazy(() => import('./pages/ReliefPage'))

// Full-page loading fallback
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1220' }}>
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6"
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #00D4FF20, #3B82F620)',
            border: '2px solid transparent',
            borderTopColor: '#00D4FF',
            borderRightColor: '#3B82F6',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="w-6 h-6" style={{ color: '#00D4FF' }} />
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold gradient-text mb-1">ResQAI</h2>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </motion.div>
  </div>
)

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            },
            success: {
              iconTheme: { primary: '#22C55E', secondary: '#fff' },
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(34,197,94,0.3)',
              },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(239,68,68,0.3)',
              },
            },
            loading: {
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(0,212,255,0.3)',
              },
            },
          }}
        />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Public Routes ── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ── Protected Routes (any authenticated user) ── */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <MapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sos"
              element={
                <ProtectedRoute>
                  <SOSPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai"
              element={
                <ProtectedRoute>
                  <AIPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/relief"
              element={
                <ProtectedRoute>
                  <ReliefPage />
                </ProtectedRoute>
              }
            />

            {/* ── Role-Restricted Routes ── */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rescue"
              element={
                <ProtectedRoute requiredRole={['rescue_team', 'admin']}>
                  <RescuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer"
              element={
                <ProtectedRoute requiredRole={['volunteer', 'admin']}>
                  <VolunteerPage />
                </ProtectedRoute>
              }
            />

            {/* ── Catch-all ── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
