import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Map, CloudLightning, Save } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import toast from 'react-hot-toast'

const SettingsPage: React.FC = () => {
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [pushAlerts, setPushAlerts] = useState(true)
  const [mapTheme, setMapTheme] = useState('dark')
  const [offlineSync, setOfflineSync] = useState(false)

  useEffect(() => {
    // Load preference configurations from localStorage
    const savedSms = localStorage.getItem('resqai_settings_sms')
    const savedEmail = localStorage.getItem('resqai_settings_email')
    const savedPush = localStorage.getItem('resqai_settings_push')
    const savedTheme = localStorage.getItem('resqai_settings_theme')
    const savedSync = localStorage.getItem('resqai_settings_sync')

    if (savedSms !== null) setSmsAlerts(savedSms === 'true')
    if (savedEmail !== null) setEmailAlerts(savedEmail === 'true')
    if (savedPush !== null) setPushAlerts(savedPush === 'true')
    if (savedTheme !== null) setMapTheme(savedTheme)
    if (savedSync !== null) setOfflineSync(savedSync === 'true')
  }, [])

  const handleSaveSettings = () => {
    localStorage.setItem('resqai_settings_sms', smsAlerts.toString())
    localStorage.setItem('resqai_settings_email', emailAlerts.toString())
    localStorage.setItem('resqai_settings_push', pushAlerts.toString())
    localStorage.setItem('resqai_settings_theme', mapTheme)
    localStorage.setItem('resqai_settings_sync', offlineSync.toString())

    toast.success("Preferences updated successfully")
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0B1220' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">System <span className="gradient-text">Settings</span></h1>
            <p className="text-gray-400">Configure your warning alerts, map theme preferences, and offline data syncs.</p>
          </div>
          <button onClick={handleSaveSettings} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
            <Save size={16} /> Save Changes
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Notification Alert Configuration */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 border-t-4 border-[#F59E0B]">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Bell className="text-[#F59E0B]"/> Alert Preferences</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-white/5 cursor-pointer">
                <div>
                  <span className="text-sm font-semibold text-white block">SMS Crisis Alerts</span>
                  <span className="text-xs text-gray-500">Send emergency updates to registered phone number</span>
                </div>
                <input type="checkbox" checked={smsAlerts} onChange={e => setSmsAlerts(e.target.checked)} className="w-5 h-5 accent-[#F59E0B] rounded cursor-pointer" />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-white/5 cursor-pointer">
                <div>
                  <span className="text-sm font-semibold text-white block">Email Broadcasts</span>
                  <span className="text-xs text-gray-500">Receive comprehensive weather reports via email</span>
                </div>
                <input type="checkbox" checked={emailAlerts} onChange={e => setEmailAlerts(e.target.checked)} className="w-5 h-5 accent-[#F59E0B] rounded cursor-pointer" />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-white/5 cursor-pointer">
                <div>
                  <span className="text-sm font-semibold text-white block">Push Notifications</span>
                  <span className="text-xs text-gray-500">Show immediate warnings in current browser tab</span>
                </div>
                <input type="checkbox" checked={pushAlerts} onChange={e => setPushAlerts(e.target.checked)} className="w-5 h-5 accent-[#F59E0B] rounded cursor-pointer" />
              </label>
            </div>
          </motion.div>

          <div className="space-y-8">
            {/* Map Customization */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-t-4 border-[#3B82F6]">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Map className="text-[#3B82F6]"/> Map Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">Leaflet Theme Style</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setMapTheme('dark')}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all ${mapTheme === 'dark' ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white font-bold' : 'bg-slate-950/40 border-white/10 text-gray-400'}`}
                    >
                      CartoDB Dark Matter
                    </button>
                    <button 
                      onClick={() => setMapTheme('standard')}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all ${mapTheme === 'standard' ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white font-bold' : 'bg-slate-950/40 border-white/10 text-gray-400'}`}
                    >
                      OpenStreetMap Standard
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Offline Support */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 border-t-4 border-[#14B8A6]">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><CloudLightning className="text-[#14B8A6]"/> Offline Data Sync</h3>
              <label className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-white/5 cursor-pointer">
                <div>
                  <span className="text-sm font-semibold text-white block">Offline Map Caching</span>
                  <span className="text-xs text-gray-500 font-medium text-gray-500">Cache local coordinates and shelter locations for offline grid access</span>
                </div>
                <input type="checkbox" checked={offlineSync} onChange={e => setOfflineSync(e.target.checked)} className="w-5 h-5 accent-[#14B8A6] rounded cursor-pointer" />
              </label>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SettingsPage
