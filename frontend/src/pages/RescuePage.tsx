import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Truck, Search, Plus, MapPin, Users, Phone } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { rescueTeamsAPI } from '../lib/api'
import type { RescueTeam } from '../types'
import toast from 'react-hot-toast'

const RescuePage: React.FC = () => {
  const [teams, setTeams] = useState<RescueTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const res = await rescueTeamsAPI.list()
      setTeams(res.data)
    } catch (error) {
      toast.error("Failed to load rescue teams")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'available': return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'dispatched': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'on_scene': return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.specialization.toLowerCase().includes(searchTerm.toLowerCase())
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
          <button className="btn-primary flex items-center gap-2">
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
                className="glass-card p-6 border-t-4 hover:-translate-y-1 transition-transform"
                style={{ borderColor: team.status.toLowerCase() === 'available' ? '#22C55E' : '#3B82F6' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Truck className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{team.name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{team.specialization}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(team.status)}`}>
                    {team.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-500" /> 
                    {team.latitude.toFixed(4)}, {team.longitude.toFixed(4)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Users className="w-4 h-4 text-gray-500" /> 
                    {team.members_count} active members
                  </div>
                  {team.contact && (
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Phone className="w-4 h-4 text-gray-500" /> 
                      {team.contact}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button className="btn-glass flex-1 py-2 text-sm text-center">Update Status</button>
                  <button className="btn-primary flex-1 py-2 text-sm text-center">Dispatch</button>
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
    </div>
  )
}

export default RescuePage
