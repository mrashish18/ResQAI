import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, LayoutDashboard, Map, AlertTriangle, Bot, BarChart3,
  Bell, User, LogOut, Settings, ChevronDown, Menu, X,
  Shield, Users, Package, Heart
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/map', label: 'Live Map', icon: Map },
  { href: '/sos', label: 'SOS', icon: AlertTriangle },
  { href: '/ai', label: 'AI', icon: Bot },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
]

const roleLinks: Record<string, { href: string; label: string; icon: React.FC<{ className?: string }> }[]> = {
  admin: [{ href: '/admin', label: 'Admin', icon: Shield }],
  rescue_team: [{ href: '/rescue', label: 'Rescue', icon: Users }],
  volunteer: [{ href: '/volunteer', label: 'Volunteer', icon: Heart }],
  ngo: [{ href: '/relief', label: 'Relief', icon: Package }],
  government: [{ href: '/relief', label: 'Relief', icon: Package }],
}

interface MockNotification {
  id: number
  title: string
  message: string
  time: string
  is_read: boolean
  priority: string
}

const mockNotifications: MockNotification[] = [
  { id: 1, title: 'New SOS Alert', message: 'Emergency reported near Mumbai Central', time: '2m ago', is_read: false, priority: 'critical' },
  { id: 2, title: 'Flood Warning', message: 'High risk detected in Coastal Zone A', time: '15m ago', is_read: false, priority: 'high' },
  { id: 3, title: 'Team Deployed', message: 'Rescue Team Alpha dispatched', time: '1h ago', is_read: true, priority: 'medium' },
]

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const unreadCount = mockNotifications.filter(n => !n.is_read).length

  const allLinks = [
    ...navLinks,
    ...(user && roleLinks[user.role] ? roleLinks[user.role] : []),
  ]

  const isActive = (href: string) => location.pathname === href

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const priorityColor: Record<string, string> = {
    critical: '#EF4444',
    high: '#F59E0B',
    medium: '#3B82F6',
    low: '#22C55E',
  }

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(11,18,32,0.95)'
          : 'rgba(11,18,32,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}
            >
              <Zap className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold gradient-text">ResQAI</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated && allLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    color: active ? '#00D4FF' : 'rgba(255,255,255,0.65)',
                    background: active ? 'rgba(0,212,255,0.08)' : 'transparent',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'rgba(0,212,255,0.1)',
                        border: '1px solid rgba(0,212,255,0.2)',
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                </Link>
              )
            })}
            {!isAuthenticated && (
              <>
                <a href="#features" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                  How It Works
                </a>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notification Bell */}
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false) }}
                    className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-white/10"
                  >
                    <Bell className="w-5 h-5 text-gray-300" />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                        style={{ background: '#EF4444' }}
                      >
                        {unreadCount}
                      </motion.span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-12 w-80 glass-card overflow-hidden"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                          <h3 className="text-sm font-semibold text-white">Notifications</h3>
                          <button className="text-xs" style={{ color: '#00D4FF' }}>Mark all read</button>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {mockNotifications.map((notif) => (
                            <div
                              key={notif.id}
                              className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                              style={{ opacity: notif.is_read ? 0.6 : 1 }}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                                  style={{ background: priorityColor[notif.priority] || '#3B82F6' }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{notif.title}</p>
                                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 text-center border-t border-white/10">
                          <Link
                            to="/notifications"
                            className="text-xs font-medium"
                            style={{ color: '#00D4FF' }}
                            onClick={() => setNotifOpen(false)}
                          >
                            View all notifications →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Menu */}
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false) }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 hover:bg-white/10"
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}
                    >
                      {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-semibold text-white leading-none">
                        {user?.full_name?.split(' ')[0] || 'User'}
                      </p>
                      <p className="text-[10px] capitalize mt-0.5" style={{ color: '#00D4FF' }}>
                        {user?.role?.replace('_', ' ') || 'citizen'}
                      </p>
                    </div>
                    <ChevronDown
                      className="w-4 h-4 text-gray-400 transition-transform duration-200"
                      style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-12 w-52 glass-card overflow-hidden"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        <div className="p-4 border-b border-white/10">
                          <p className="text-sm font-semibold text-white">{user?.full_name}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{user?.email}</p>
                        </div>
                        <div className="p-2">
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User className="w-4 h-4" /> Profile
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4" /> Settings
                          </Link>
                          <div className="border-t border-white/10 mt-2 pt-2">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
                              style={{ color: '#EF4444' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/10"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #00D4FF, #3B82F6)',
                    boxShadow: '0 4px 15px rgba(0,212,255,0.3)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-white/10"
            style={{ background: 'rgba(11,18,32,0.98)' }}
          >
            <div className="px-4 py-4 space-y-1">
              {isAuthenticated ? (
                <>
                  {allLinks.map((link) => {
                    const Icon = link.icon
                    const active = isActive(link.href)
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                        style={{
                          color: active ? '#00D4FF' : 'rgba(255,255,255,0.7)',
                          background: active ? 'rgba(0,212,255,0.1)' : 'transparent',
                          borderLeft: active ? '3px solid #00D4FF' : '3px solid transparent',
                        }}
                      >
                        <Icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                    )
                  })}
                  <div className="pt-3 border-t border-white/10 mt-3">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                      style={{ color: '#EF4444' }}
                    >
                      <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar
