import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, LayoutDashboard, Map, AlertTriangle, Bot, BarChart3,
  Bell, ChevronLeft, ChevronRight, Shield,
  Package, Heart, Radio, Home, User, Settings, LogOut
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

interface NavItem {
  href: string
  label: string
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>
  badge?: number
  color?: string
}

const baseNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#00D4FF' },
  { href: '/map', label: 'Live Map', icon: Map, color: '#3B82F6' },
  { href: '/sos', label: 'SOS Report', icon: AlertTriangle, color: '#EF4444', badge: 3 },
  { href: '/ai', label: 'AI Features', icon: Bot, color: '#8B5CF6' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, color: '#22C55E' },
  { href: '/notifications', label: 'Notifications', icon: Bell, color: '#F59E0B', badge: 5 },
]

const roleExtraItems: Record<string, NavItem[]> = {
  admin: [{ href: '/admin', label: 'Admin Panel', icon: Shield, color: '#EC4899' }],
  rescue_team: [{ href: '/rescue', label: 'Rescue Panel', icon: Radio, color: '#F97316' }],
  volunteer: [{ href: '/volunteer', label: 'Volunteer', icon: Heart, color: '#EC4899' }],
  ngo: [{ href: '/relief', label: 'Relief Mgmt', icon: Package, color: '#14B8A6' }],
  government: [{ href: '/relief', label: 'Relief Mgmt', icon: Package, color: '#14B8A6' }],
}

interface SidebarProps {
  defaultCollapsed?: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ defaultCollapsed = false }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  const navItems: NavItem[] = [
    ...baseNavItems,
    ...(user && roleExtraItems[user.role] ? roleExtraItems[user.role] : []),
    { href: '/relief', label: 'Relief Mgmt', icon: Home, color: '#14B8A6' },
  ]

  // Remove duplicates by href
  const uniqueNavItems = navItems.filter(
    (item, index, self) => index === self.findIndex((i) => i.href === item.href)
  )

  const isActive = (href: string) => location.pathname === href

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen flex-shrink-0 overflow-hidden"
      style={{
        background: 'rgba(11,18,32,0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-16 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #00D4FF, #3B82F6)',
          border: '2px solid #0B1220',
        }}
      >
        {collapsed
          ? <ChevronRight className="w-3 h-3 text-white" />
          : <ChevronLeft className="w-3 h-3 text-white" />
        }
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/8">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}
        >
          <Zap className="w-5 h-5 text-white" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-lg font-bold gradient-text">ResQAI</span>
              <p className="text-[10px] text-gray-500 -mt-0.5">Emergency Response</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {!collapsed && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 px-3 mb-3">
              Navigation
            </p>
          )}

          {uniqueNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                to={item.href}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
                style={{
                  color: active ? item.color || '#00D4FF' : 'rgba(255,255,255,0.55)',
                  background: active ? `${item.color || '#00D4FF'}15` : 'transparent',
                  borderLeft: active ? `3px solid ${item.color || '#00D4FF'}` : '3px solid transparent',
                }}
                title={collapsed ? item.label : undefined}
              >
                <div
                  className="relative flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{
                    background: active
                      ? `${item.color || '#00D4FF'}20`
                      : 'transparent',
                  }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: active ? item.color || '#00D4FF' : 'rgba(255,255,255,0.55)' }}
                  />
                  {item.badge && (
                    <span
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                      style={{ background: '#EF4444' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <span
                          className="px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white"
                          style={{ background: '#EF4444' }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Active indicator glow */}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: `${item.color || '#00D4FF'}08` }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-white/8 my-4 mx-2" />

        {/* Settings */}
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 px-3 mb-3">
            Account
          </p>
        )}
        <Link
          to="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-gray-400 hover:text-white hover:bg-white/5"
          title={collapsed ? 'Profile' : undefined}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Profile
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-gray-400 hover:text-white hover:bg-white/5"
          title={collapsed ? 'Settings' : undefined}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <Settings className="w-4 h-4" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </nav>

      {/* User Info Card at Bottom */}
      <div className="border-t border-white/8 p-3">
        <div
          className="rounded-xl p-3 flex items-center gap-3 transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}
          >
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-semibold text-white truncate">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-[10px] capitalize" style={{ color: '#00D4FF' }}>
                  {user?.role?.replace('_', ' ') || 'citizen'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0"
            style={{ color: '#EF4444' }}
            title="Sign Out"
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Online status */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-3 mt-2"
            >
              <div className="status-dot active" />
              <span className="text-[10px] text-gray-500">System Online</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  )
}

export default Sidebar
