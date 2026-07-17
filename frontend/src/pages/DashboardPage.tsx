import React from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, AlertTriangle, Users, Package, Activity, TrendingUp, Shield, Map } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'

const statCards = [
  { label: 'Active Incidents', value: '14', change: '+3 today', color: '#EF4444', icon: AlertTriangle },
  { label: 'People Rescued', value: '1,284', change: '+47 this week', color: '#22C55E', icon: Users },
  { label: 'Resources Available', value: '89%', change: 'Sufficient supply', color: '#3B82F6', icon: Package },
  { label: 'Response Time', value: '8.2m', change: '-1.3m vs last week', color: '#00D4FF', icon: Activity },
]

const recentIncidents = [
  { id: 1, title: 'Flash Flood - Mumbai Coastal', severity: 'critical', status: 'active', time: '12m ago', type: 'flood' },
  { id: 2, title: 'Earthquake Tremors - Nashik', severity: 'high', status: 'monitoring', time: '45m ago', type: 'earthquake' },
  { id: 3, title: 'Cyclone Warning - Konkan', severity: 'high', status: 'active', time: '2h ago', type: 'cyclone' },
  { id: 4, title: 'Landslide - Mahabaleshwar', severity: 'medium', status: 'resolved', time: '5h ago', type: 'landslide' },
]

const severityColor: Record<string, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#22C55E',
}

const statusBg: Record<string, string> = {
  active: 'rgba(239,68,68,0.15)',
  monitoring: 'rgba(234,179,8,0.15)',
  resolved: 'rgba(34,197,94,0.15)',
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen" style={{ background: '#0B1220' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-black text-white mb-1">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'},{' '}
              <span className="gradient-text">{user?.full_name?.split(' ')[0] || 'User'}</span>
            </h1>
            <p className="text-gray-400">Here's the current emergency operations overview.</p>
          </motion.div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {statCards.map((card, i) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="glass-card p-6"
                  style={{ border: `1px solid ${card.color}20` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: `${card.color}15`, border: `1px solid ${card.color}25` }}>
                      <Icon className="w-5 h-5" style={{ color: card.color }} />
                    </div>
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="text-3xl font-black text-white mb-1">{card.value}</div>
                  <div className="text-sm text-gray-500 mb-1">{card.label}</div>
                  <div className="text-xs" style={{ color: card.color }}>{card.change}</div>
                </motion.div>
              )
            })}
          </div>

          {/* Recent Incidents */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white">Recent Incidents</h2>
                  <button className="text-xs px-3 py-1.5 rounded-lg" style={{ color: '#00D4FF', background: 'rgba(0,212,255,0.1)' }}>
                    View All →
                  </button>
                </div>
                <div className="space-y-3">
                  {recentIncidents.map((inc, i) => (
                    <motion.div
                      key={inc.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-white/5 cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: severityColor[inc.severity] }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{inc.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{inc.time}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-medium px-2 py-1 rounded-lg capitalize"
                          style={{ color: severityColor[inc.severity], background: `${severityColor[inc.severity]}15` }}>
                          {inc.severity}
                        </span>
                        <span className="text-xs font-medium px-2 py-1 rounded-lg capitalize"
                          style={{ color: 'white', background: statusBg[inc.status] }}>
                          {inc.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6 h-fit"
            >
              <h2 className="text-lg font-bold text-white mb-5">Quick Actions</h2>
              <div className="space-y-3">
                {[
                  { label: 'Report SOS', href: '/sos', icon: AlertTriangle, color: '#EF4444' },
                  { label: 'View Live Map', href: '/map', icon: Map, color: '#3B82F6' },
                  { label: 'AI Analysis', href: '/ai', icon: Shield, color: '#8B5CF6' },
                  { label: 'Analytics', href: '/analytics', icon: LayoutDashboard, color: '#00D4FF' },
                ].map((action) => {
                  const Icon = action.icon
                  return (
                    <a
                      key={action.label}
                      href={action.href}
                      className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-105"
                      style={{ background: `${action.color}10`, border: `1px solid ${action.color}20` }}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: `${action.color}20` }}>
                        <Icon className="w-4 h-4" style={{ color: action.color }} />
                      </div>
                      <span className="text-sm font-medium text-white">{action.label}</span>
                    </a>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
