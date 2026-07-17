import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, Search, Plus, MapPin, Users, X, ShieldAlert } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { rescueTeamsAPI, incidentsAPI } from '../lib/api'
import type { RescueTeam, Incident } from '../types'
import toast from 'react-hot-toast'

const RescuePage: React.FC = () => {
  const [teams, setTeams] = useState<RescueTeam[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Modal states
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showDispatchModal, setShowDispatchModal] = useState(false)

  // Selection states
  const [selectedTeam, setSelectedTeam] = useState<RescueTeam | null>(null)

  // Form states
  const [registerForm, setRegisterForm] = useState({ name: '', specialization: 'Flood Rescue', members_count: '10', latitude: '', longitude: '' })
  const [statusForm, setStatusForm] = useState({ status: 'available' })
  const [dispatchForm, setDispatchForm] = useState({ incident_id: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [teamsRes, incidentsRes] = await Promise.all([
        rescueTeamsAPI.list(),
        incidentsAPI.list()
      ])
      setTeams(teamsRes.data)
      // Filter only active incidents for dispatch
      const activeIncidents = (incidentsRes.data || []).filter((inc: Incident) => inc.status !== 'resolved')
      setIncidents(activeIncidents)
    } catch (error) {
      toast.error("Failed to load rescue details")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'available': return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'deployed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'returning': return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!registerForm.name || !registerForm.latitude || !registerForm.longitude) {
      toast.error("Please fill in required fields")
      return
    }
    try {
      await rescueTeamsAPI.create({
        name: registerForm.name,
        specialization: registerForm.specialization,
        members_count: parseInt(registerForm.members_count) || 10,
        latitude: parseFloat(registerForm.latitude),
        longitude: parseFloat(registerForm.longitude)
      })
      toast.success("Rescue team registered")
      setShowRegisterModal(false)
      setRegisterForm({ name: '', specialization: 'Flood Rescue', members_count: '10', latitude: '', longitude: '' })
      fetchData()
    } catch (error) {
      toast.error("Failed to register team")
    }
  }

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeam) return
    try {
      await rescueTeamsAPI.updateStatus(selectedTeam.id, statusForm.status)
      toast.success("Team status updated")
      setShowStatusModal(false)
      fetchData()
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeam || !dispatchForm.incident_id) {
      toast.error("Please select an incident")
      return
    }
    try {
      await rescueTeamsAPI.assign(selectedTeam.id, parseInt(dispatchForm.incident_id))
      toast.success("Rescue team dispatched to incident")
      setShowDispatchModal(false)
      fetchData()
    } catch (error) {
      toast.error("Failed to dispatch team")
    }
  }

  const handleUnassignTeam = async (teamId: number) => {
    try {
      await rescueTeamsAPI.unassign(teamId)
      toast.success("Rescue team unassigned from incident")
      fetchData()
    } catch (error) {
      toast.error("Failed to recall team")
    }
  }

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.specialization && t.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="flex min-h-screen" style={{ background: '#0B1220' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Rescue <span className="gradient-text">Operations</span></h1>
            <p className="text-gray-400">Dispatch, track, and manage specialized rescue teams in the field.</p>
          </div>
          <button onClick={() => setShowRegisterModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Register Team
          </button>
        </motion.div>

        <div className="glass-card p-4 mb-6 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              className="input-field w-full pl-10" 
              placeholder="Search teams by name or specialization..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-10 h-10 border-4 border-[#3B82F6] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: idx * 0.05 }}
                key={team.id} 
                className="glass-card p-6 border-t-4 hover:-translate-y-1 transition-all flex flex-col h-full"
                style={{ borderColor: team.status.toLowerCase() === 'available' ? '#22C55E' : team.status.toLowerCase() === 'deployed' ? '#3B82F6' : '#F97316' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Truck className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">{team.name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{team.specialization || "General Rescue"}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(team.status)}`}>
                    {team.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-500 shrink-0" /> 
                    <span>{team.latitude.toFixed(4)}, {team.longitude.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Users className="w-4 h-4 text-gray-500 shrink-0" /> 
                    <span>{team.members_count} active members</span>
                  </div>
                  {team.assigned_incident_id ? (
                    <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl flex flex-col gap-1 mt-2">
                      <div className="text-[10px] text-blue-400 uppercase font-black tracking-wider">Assigned Mission</div>
                      <div className="text-xs text-white truncate font-medium">Incident #{team.assigned_incident_id}</div>
                      <button onClick={() => handleUnassignTeam(team.id)} className="text-[10px] text-red-400 hover:text-red-300 font-semibold self-start mt-2">Recall Team ×</button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 mt-2 italic">No active mission assignment</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedTeam(team)
                      setStatusForm({ status: team.status })
                      setShowStatusModal(true)
                    }} 
                    className="btn-glass flex-1 py-2 text-sm text-center"
                  >
                    Update Status
                  </button>
                  {team.status.toLowerCase() === 'available' ? (
                    <button 
                      onClick={() => {
                        setSelectedTeam(team)
                        setDispatchForm({ incident_id: '' })
                        setShowDispatchModal(true)
                      }}
                      className="btn-primary flex-1 py-2 text-sm text-center"
                    >
                      Dispatch
                    </button>
                  ) : (
                    <button 
                      disabled 
                      className="btn-primary flex-1 py-2 text-sm text-center opacity-40 cursor-not-allowed"
                    >
                      On Duty
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            
            {filteredTeams.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No rescue teams found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- MODAL SYSTEM --- */}
      <AnimatePresence>
        {/* Register Team Modal */}
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card p-6 max-w-md w-full mx-4 border border-white/10 relative">
              <button onClick={() => setShowRegisterModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={18}/></button>
              <h3 className="text-xl font-bold text-white mb-4">Register Rescue Team</h3>
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Team Name</label>
                  <input type="text" value={registerForm.name} onChange={e => setRegisterForm({...registerForm, name: e.target.value})} className="input-field w-full" placeholder="e.g. NDRF Force Delta" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Specialization</label>
                  <input type="text" value={registerForm.specialization} onChange={e => setRegisterForm({...registerForm, specialization: e.target.value})} className="input-field w-full" placeholder="e.g. Deep Water Rescue, Medical Aid" required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Members</label>
                    <input type="number" value={registerForm.members_count} onChange={e => setRegisterForm({...registerForm, members_count: e.target.value})} className="input-field w-full" placeholder="10" required />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Latitude</label>
                    <input type="number" step="any" value={registerForm.latitude} onChange={e => setRegisterForm({...registerForm, latitude: e.target.value})} className="input-field w-full" placeholder="19.07" required />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Longitude</label>
                    <input type="number" step="any" value={registerForm.longitude} onChange={e => setRegisterForm({...registerForm, longitude: e.target.value})} className="input-field w-full" placeholder="72.87" required />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-2" style={{ background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)', borderColor: '#2563EB' }}>Register Force</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Update Status Modal */}
        {showStatusModal && selectedTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card p-6 max-w-md w-full mx-4 border border-white/10 relative">
              <button onClick={() => setShowStatusModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={18}/></button>
              <h3 className="text-xl font-bold text-white mb-2">Update Force Status</h3>
              <p className="text-xs text-gray-400 mb-4">{selectedTeam.name}</p>
              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Select Status</label>
                  <select value={statusForm.status} onChange={e => setStatusForm({ status: e.target.value })} className="input-field w-full">
                    <option value="available">Available (Standby)</option>
                    <option value="deployed">Deployed (On Mission)</option>
                    <option value="returning">Returning (Refueling)</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-2">Apply Status</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Dispatch Modal */}
        {showDispatchModal && selectedTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card p-6 max-w-md w-full mx-4 border border-white/10 relative">
              <button onClick={() => setShowDispatchModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={18}/></button>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><ShieldAlert className="text-[#3B82F6]"/> Dispatch Mission</h3>
              <p className="text-xs text-gray-400 mb-4">Select active emergency site to dispatch {selectedTeam.name}</p>
              <form onSubmit={handleDispatchSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Target Incident</label>
                  <select value={dispatchForm.incident_id} onChange={e => setDispatchForm({ incident_id: e.target.value })} className="input-field w-full" required>
                    <option value="">-- Select Active Site --</option>
                    {incidents.map(inc => (
                      <option key={inc.id} value={inc.id}>{inc.title} ({inc.severity.toUpperCase()})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-2" style={{ background: 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)', borderColor: '#DC2626' }}>Dispatch Force</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RescuePage
