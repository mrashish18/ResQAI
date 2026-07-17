import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Droplets, Wind, AlertTriangle, CheckCircle,
  Settings, Trash2, Eye, X, Mail,
  MessageSquare, Shield, Zap, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight
} from 'lucide-react'

// ─── Types & Mock Data ────────────────────────────────────────────────────────

type NotifType = 'flood' | 'cyclone' | 'earthquake' | 'rescue' | 'system' | 'emergency'

interface Notification {
  id: string
  type: NotifType
  title: string
  message: string
  fullMessage: string
  time: string
  timeAgo: string
  read: boolean
  severity: 'critical' | 'high' | 'medium' | 'low'
}

const INIT_NOTIFICATIONS: Notification[] = [
  { id: 'N001', type: 'emergency', title: 'EMERGENCY: Mass Evacuation – Zone 3', message: 'Immediate evacuation order for Zone 3 due to rising flood waters.', fullMessage: 'Effective immediately, all residents in Zone 3 (Tambaram West, Chrompet, Pallavaram) must evacuate to designated shelters. Water levels are expected to rise 4 meters. Do not delay. Move to higher ground or nearest shelter.', time: '11:42 AM', timeAgo: '5 mins ago', read: false, severity: 'critical' },
  { id: 'N002', type: 'flood', title: 'Flood Warning – Tambaram Basin', message: 'Water levels in Tambaram basin rising above critical threshold.', fullMessage: 'The Tambaram basin has breached critical water levels. Authorities are issuing a Stage-2 flood warning. Residents near the lake area should move to relief camps immediately. NDRF teams are being deployed.', time: '11:30 AM', timeAgo: '17 mins ago', read: false, severity: 'critical' },
  { id: 'N003', type: 'cyclone', title: 'Cyclone Tej – 24hr Advisory', message: 'Cyclone Tej expected to make landfall in 24 hours near Puri coast.', fullMessage: 'IMD has issued a Red Alert for coastal Odisha as Cyclone Tej (Category 4) is expected to make landfall near Puri between 2-4 AM tomorrow. Wind speeds of 180-220 km/h with heavy rainfall are expected. Fishermen are strictly advised not to venture into the sea.', time: '10:58 AM', timeAgo: '49 mins ago', read: false, severity: 'high' },
  { id: 'N004', type: 'earthquake', title: 'Earthquake 4.8M – Jaipur Region', message: 'Minor earthquake recorded 40 km NE of Jaipur. No major damage reported.', fullMessage: 'A magnitude 4.8 earthquake was recorded at 10:22 AM IST, 40 km northeast of Jaipur, Rajasthan. Depth: 12 km. Felt in surrounding districts. No major structural damage reported. Aftershocks possible. Residents advised to stay cautious.', time: '10:30 AM', timeAgo: '1 hr ago', read: true, severity: 'medium' },
  { id: 'N005', type: 'rescue', title: 'Mission Complete – Delta Squad', message: 'Delta Squad successfully rescued 12 persons from Velachery flood zone.', fullMessage: 'Team Delta Squad has successfully completed their rescue mission in the Velachery lake area. 12 persons (including 3 children and 2 elderly) have been safely evacuated to St. Thomas School Relief Camp. All team members are safe and returning to base.', time: '09:45 AM', timeAgo: '2 hrs ago', read: true, severity: 'low' },
  { id: 'N006', type: 'system', title: 'System Backup Complete', message: 'Automated system backup completed successfully at 09:00 AM.', fullMessage: 'The scheduled system backup has been completed successfully. All critical data including incident logs, user records, and resource inventory have been backed up to secure cloud storage. Next backup scheduled at 9:00 PM.', time: '09:00 AM', timeAgo: '2 hrs 47 mins ago', read: true, severity: 'low' },
  { id: 'N007', type: 'flood', title: 'Rain Alert – Heavy Rainfall Advisory', message: 'IMD issues Red Alert for 5 districts in Tamil Nadu for next 48 hours.', fullMessage: 'The Indian Meteorological Department has issued a Red Alert for Chennai, Kancheepuram, Chengalpattu, Vellore, and Ranipet districts. Heavy to extremely heavy rainfall expected over the next 48 hours. Schools and colleges to remain closed.', time: '08:30 AM', timeAgo: '3 hrs ago', read: true, severity: 'high' },
  { id: 'N008', type: 'emergency', title: 'SOS Activated – Citizen Report', message: 'Multiple SOS signals from Velachery Lake Road area.', fullMessage: 'Multiple citizens have activated the SOS feature from the Velachery Lake Road area. 3 households (approx. 14 people) are stranded on rooftops. Nearest rescue team (Karan Squad) has been auto-dispatched. ETA: 18 minutes.', time: '08:15 AM', timeAgo: '3 hrs 30 mins ago', read: false, severity: 'critical' },
  { id: 'N009', type: 'rescue', title: 'Rescue Team Deployed – Alpha Strike', message: 'Alpha Strike team deployed to Tambaram flood zone for evacuation.', fullMessage: 'Alpha Strike rescue team (8 members) has been deployed to Tambaram West, Zone 3. Mission objective: Evacuate 47 stranded persons. Team equipped with 2 inflatable boats, medical kits, and emergency supplies. Team is en route, ETA 8 minutes.', time: '07:55 AM', timeAgo: '3 hrs 50 mins ago', read: true, severity: 'medium' },
  { id: 'N010', type: 'system', title: 'New User Registered', message: 'Volunteer Lakshmi Iyer registered and pending verification.', fullMessage: 'A new volunteer account has been created: Lakshmi Iyer (lakshmi@rescue.in). Skills: First Aid, Cooking, Translation. Account is pending admin verification. Please review and approve/reject.', time: '07:30 AM', timeAgo: '4 hrs ago', read: true, severity: 'low' },
  { id: 'N011', type: 'cyclone', title: 'High Tide Warning – Mumbai Coast', message: 'High tide alert issued for Mumbai coastline between 3-6 PM.', fullMessage: 'Mumbai Maritime Board has issued a high tide warning for the western coastline. Expected tide height: 5.2 meters at 4:30 PM. Residents of low-lying coastal areas in Versova, Juhu, and Bandra are advised to move to higher ground. Boats should remain docked.', time: '07:00 AM', timeAgo: '4 hrs 47 mins ago', read: true, severity: 'medium' },
  { id: 'N012', type: 'earthquake', title: 'Aftershock 3.2M – Jaipur', message: 'Minor aftershock recorded following earlier earthquake near Jaipur.', fullMessage: 'A 3.2 magnitude aftershock was recorded 35 km NE of Jaipur, 45 minutes after the earlier 4.8M quake. This is within expected aftershock patterns. Additional aftershocks may occur in the next 24-48 hours. Residents should avoid unsafe structures.', time: '06:30 AM', timeAgo: '5 hrs ago', read: true, severity: 'low' },
  { id: 'N013', type: 'rescue', title: 'Medical Supplies Delivered', message: 'Emergency medical supplies reached Rajiv Gandhi Stadium shelter.', fullMessage: '200 first aid kits, 50 units of ORS packets, and emergency medications have been successfully delivered to the Rajiv Gandhi Stadium relief shelter. Distribution to affected persons is now underway. Coordinated by NGO Helping Hands.', time: '06:00 AM', timeAgo: '5 hrs 47 mins ago', read: true, severity: 'low' },
  { id: 'N014', type: 'system', title: 'Database Sync Complete', message: 'Incident database synchronized across all nodes.', fullMessage: 'The distributed incident database has been fully synchronized across all regional nodes (Chennai, Mumbai, Kolkata, Delhi, Hyderabad). All incident records, resource inventories, and team assignments are now consistent. Last sync duration: 2 min 14 sec.', time: '05:30 AM', timeAgo: '6 hrs ago', read: true, severity: 'low' },
  { id: 'N015', type: 'flood', title: 'Flood Subsiding – Kochi West', message: 'Water levels receding in Kochi western suburbs. Relief operations continuing.', fullMessage: 'Water levels in Kochi western suburbs (Ernakulam, Thevara) are receding at approximately 10 cm per hour. Over 1,200 displaced persons remain in relief camps. Delta Squad is conducting final sweeps for stranded individuals. Power restoration is expected by evening.', time: '05:00 AM', timeAgo: '6 hrs 47 mins ago', read: true, severity: 'medium' },
]

// ─── Notification Type Config ─────────────────────────────────────────────────

const typeConfig: Record<NotifType, { icon: React.ReactNode; color: string; bgColor: string; borderColor: string }> = {
  flood: {
    icon: <Droplets size={16} />,
    color: '#00D4FF',
    bgColor: '#00D4FF20',
    borderColor: '#00D4FF40',
  },
  cyclone: {
    icon: <Wind size={16} />,
    color: '#F59E0B',
    bgColor: '#F59E0B20',
    borderColor: '#F59E0B40',
  },
  earthquake: {
    icon: <AlertTriangle size={16} />,
    color: '#F97316',
    bgColor: '#F9731620',
    borderColor: '#F9731640',
  },
  rescue: {
    icon: <CheckCircle size={16} />,
    color: '#22C55E',
    bgColor: '#22C55E20',
    borderColor: '#22C55E40',
  },
  system: {
    icon: <Settings size={16} />,
    color: '#9CA3AF',
    bgColor: '#9CA3AF20',
    borderColor: '#9CA3AF40',
  },
  emergency: {
    icon: <Zap size={16} />,
    color: '#EF4444',
    bgColor: '#EF444420',
    borderColor: '#EF444440',
  },
}

// ─── Toast Component ──────────────────────────────────────────────────────────

const Toast: React.FC<{ notif: Notification; onClose: () => void }> = ({ notif, onClose }) => {
  const tc = typeConfig[notif.type]
  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -60, x: 60 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      className="fixed top-5 right-5 z-50 max-w-sm w-full bg-[#0f1829] border rounded-2xl shadow-2xl p-4"
      style={{ borderColor: tc.borderColor, boxShadow: `0 0 24px 0 ${tc.color}33` }}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: tc.bgColor, color: tc.color }}>
          {tc.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">{notif.title}</p>
          <p className="text-white/50 text-xs mt-0.5 truncate">{notif.message}</p>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0">
          <X size={14} />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Notification Card Component ──────────────────────────────────────────────

const NotificationCard: React.FC<{
  notif: Notification
  onRead: (id: string) => void
  onDelete: (id: string) => void
}> = ({ notif, onRead, onDelete }) => {
  const [expanded, setExpanded] = useState(false)
  const tc = typeConfig[notif.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-colors ${!notif.read ? 'border-l-4' : ''}`}
      style={!notif.read ? { borderLeftColor: tc.color } : {}}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: tc.bgColor, color: tc.color }}
          >
            {tc.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={`text-sm font-semibold ${notif.read ? 'text-white/70' : 'text-white'}`}>{notif.title}</p>
              <span className="text-white/30 text-xs flex-shrink-0">{notif.timeAgo}</span>
            </div>
            <p className="text-white/50 text-xs mt-0.5">{notif.message}</p>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 ml-12 text-white/60 text-xs leading-relaxed border-t border-white/10 pt-3"
            >
              {notif.fullMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mt-3 ml-12">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? 'Collapse' : 'Read more'}
          </button>
          <div className="flex items-center gap-2">
            {!notif.read && (
              <button
                onClick={() => onRead(notif.id)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-white/50 text-xs hover:bg-white/10 transition-colors"
              >
                <Eye size={11} /> Mark read
              </button>
            )}
            <button
              onClick={() => onDelete(notif.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 text-red-400/60 text-xs hover:bg-red-500/20 transition-colors"
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(INIT_NOTIFICATIONS)
  const [filter, setFilter] = useState<'all' | 'unread' | 'alerts' | 'system'>('all')
  const [toast, setToast] = useState<Notification | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [notifSettings, setNotifSettings] = useState({
    push: true,
    sms: false,
    email: true,
  })
  const [alertPrefs, setAlertPrefs] = useState({
    flood: true,
    cyclone: true,
    earthquake: true,
    rescue: true,
    system: false,
    emergency: true,
  })

  // Real-time simulation: new notification every 30 seconds
  useEffect(() => {
    const SIMULATED: Notification[] = [
      { id: `SIM-${Date.now()}`, type: 'emergency', title: 'NEW: SOS Signal Received', message: 'Distress signal from Velachery Lake Road, 3 persons stranded.', fullMessage: 'A new SOS signal has been received from coordinates 12.9825° N, 80.2206° E (Velachery Lake Road). Estimated 3 persons stranded on rooftop. Nearest team (Beta Force) is being alerted.', time: 'Just now', timeAgo: 'Just now', read: false, severity: 'critical' },
    ]
    let idx = 0
    const interval = setInterval(() => {
      if (idx < SIMULATED.length) {
        const newNotif = { ...SIMULATED[idx], id: `SIM-${Date.now()}` }
        setNotifications(prev => [newNotif, ...prev])
        setToast(newNotif)
        idx++
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'alerts') return ['flood', 'cyclone', 'earthquake', 'emergency'].includes(n.type)
    if (filter === 'system') return n.type === 'system'
    return true
  })

  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const deleteNotif = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id))
  const deleteAllRead = () => setNotifications(prev => prev.filter(n => !n.read))

  const filterTabs: { id: typeof filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'system', label: 'System' },
  ]

  return (
    <div className="flex min-h-screen" style={{ background: '#0B1220', fontFamily: 'Inter, sans-serif' }}>
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast notif={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Sidebar placeholder */}
      <div className="w-64 flex-shrink-0 bg-white/3 border-r border-white/10 p-4">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Shield size={16} className="text-cyan-400" />
          </div>
          <span className="text-white font-bold text-lg">ResQAI</span>
        </div>
        <nav className="space-y-1">
          {['Dashboard', 'Map', 'Reports', 'Admin', 'Rescue', 'Volunteer', 'Relief', 'Notifications'].map(item => (
            <div key={item} className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm cursor-pointer transition-colors ${item === 'Notifications' ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
              <span>{item}</span>
              {item === 'Notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {unreadCount}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0B1220]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell size={20} className="text-white" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">Notifications</h1>
                <p className="text-white/40 text-sm">{unreadCount} unread &bull; {notifications.length} total</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-colors"
              >
                <Eye size={13} /> Mark all read
              </button>
              <button
                onClick={deleteAllRead}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
              >
                <Trash2 size={13} /> Delete read
              </button>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={`p-2 rounded-xl border border-white/10 transition-colors ${settingsOpen ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
              >
                <Settings size={16} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1">
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === tab.id
                    ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
                {tab.id === 'unread' && unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Settings Panel */}
          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-4">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Settings size={16} className="text-cyan-400" /> Notification Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Channel toggles */}
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Channels</p>
                      <div className="space-y-2">
                        {([
                          { key: 'push' as const, label: 'Push Notifications', icon: Bell },
                          { key: 'sms' as const, label: 'SMS Alerts', icon: MessageSquare },
                          { key: 'email' as const, label: 'Email Alerts', icon: Mail },
                        ]).map(({ key, label, icon: Icon }) => (
                          <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <div className="flex items-center gap-2 text-white/70 text-sm">
                              <Icon size={14} className="text-white/40" /> {label}
                            </div>
                            <button onClick={() => setNotifSettings(s => ({ ...s, [key]: !s[key] }))}>
                              {notifSettings[key]
                                ? <ToggleRight size={24} className="text-cyan-400" />
                                : <ToggleLeft size={24} className="text-white/30" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Alert type prefs */}
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Alert Types</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(Object.entries(alertPrefs) as [keyof typeof alertPrefs, boolean][]).map(([key, val]) => {
                          return (
                            <label key={key} className="flex items-center gap-2 cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors">
                              <input
                                type="checkbox"
                                checked={val}
                                onChange={() => setAlertPrefs(p => ({ ...p, [key]: !p[key] }))}
                                className="w-4 h-4 rounded accent-cyan-500"
                              />
                              <span className="text-xs capitalize text-white/60">{key}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Notifications List */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 text-white/30"
                >
                  <Bell size={36} className="mx-auto mb-3 opacity-30" />
                  <p>No notifications in this category</p>
                </motion.div>
              ) : (
                filtered.map(notif => (
                  <NotificationCard
                    key={notif.id}
                    notif={notif}
                    onRead={markRead}
                    onDelete={deleteNotif}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationsPage
