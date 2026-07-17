import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
}

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1220' }}>
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6"
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: '#00D4FF',
            borderRightColor: '#3B82F6',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield className="w-6 h-6" style={{ color: '#00D4FF' }} />
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold gradient-text mb-1">ResQAI</h2>
        <p className="text-gray-400 text-sm">Verifying access...</p>
      </div>
    </motion.div>
  </div>
)

const UnauthorizedScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B1220' }}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-12 text-center max-w-md mx-4"
    >
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
        <Shield className="w-10 h-10" style={{ color: '#EF4444' }} />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">Access Denied</h2>
      <p className="text-gray-400 mb-8">
        You don't have permission to access this page. Contact your administrator if you believe this is an error.
      </p>
      <a
        href="/dashboard"
        className="btn-primary inline-block"
      >
        Return to Dashboard
      </a>
    </motion.div>
  </div>
)

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  // Show loading screen while checking auth state
  if (isLoading) {
    return <LoadingScreen />
  }

  // Not authenticated: redirect to login with return URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role requirements if specified
  if (requiredRole && user) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

    // Admin can access everything
    const effectiveRoles = [...allowedRoles]
    if (!effectiveRoles.includes('admin')) {
      effectiveRoles.push('admin')
    }

    if (!effectiveRoles.includes(user.role)) {
      return <UnauthorizedScreen />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
