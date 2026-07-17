import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Home, Package, Plus, MapPin, Users, Phone, LayoutGrid } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { sheltersAPI, resourcesAPI } from '../lib/api'
import type { Shelter, Resource } from '../types'
import toast from 'react-hot-toast'

const ReliefPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shelters' | 'resources'>('shelters')
  const [shelters, setShelters] = useState<Shelter[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [shelRes, resRes] = await Promise.all([
        sheltersAPI.list(),
        resourcesAPI.list()
      ])
      setShelters(shelRes.data)
      setResources(resRes.data)
    } catch (error) {
      toast.error("Failed to load relief data")
    } finally {
      setLoading(false)
    }
  }

  const calculateOccupancyPercent = (current: number, max: number) => {
    if (max === 0) return 0
    return Math.min(Math.round((current / max) * 100), 100)
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0B1220' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Relief <span className="gradient-text">&amp; Resources</span></h1>
            <p className="text-gray-400">Manage emergency shelters, inventory, and relief distribution.</p>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="flex bg-[#1E293B] rounded-lg p-1">
              <button 
                onClick={() => setActiveTab('shelters')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'shelters' ? 'bg-[#22C55E] text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Home className="w-4 h-4 inline-block mr-2" /> Shelters
              </button>
              <button 
                onClick={() => setActiveTab('resources')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'resources' ? 'bg-[#F59E0B] text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Package className="w-4 h-4 inline-block mr-2" /> Resources
              </button>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Plus size={18} /> Add {activeTab === 'shelters' ? 'Shelter' : 'Resource'}
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-10 h-10 border-4 border-[#22C55E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'shelters' && shelters.map((shelter, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: idx * 0.05 }}
                key={shelter.id} 
                className="glass-card p-6 border-t-4 border-[#22C55E] flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white leading-tight">{shelter.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${shelter.status === 'open' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
                    {shelter.status.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-start gap-3 text-sm text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" /> 
                    <span>{shelter.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Phone className="w-4 h-4 text-gray-500 shrink-0" /> 
                    <span>{shelter.contact}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400 flex items-center gap-1"><Users size={14}/> Occupancy</span>
                    <span className="text-white font-bold">{shelter.current_occupancy} / {shelter.capacity}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
                    <div 
                      className={`h-2 rounded-full ${calculateOccupancyPercent(shelter.current_occupancy, shelter.capacity) > 90 ? 'bg-red-500' : 'bg-green-500'}`} 
                      style={{ width: `${calculateOccupancyPercent(shelter.current_occupancy, shelter.capacity)}%` }}
                    ></div>
                  </div>
                  <button className="btn-glass w-full py-2">Update Capacity</button>
                </div>
              </motion.div>
            ))}

            {activeTab === 'resources' && resources.map((res, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: idx * 0.05 }}
                key={res.id} 
                className="glass-card p-6 border-t-4 border-[#F59E0B] flex flex-col"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-amber-900/30 rounded-xl flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{res.name}</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{res.category}</p>
                  </div>
                </div>
                
                <div className="bg-[#0F172A] p-4 rounded-xl border border-gray-800 mb-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Available Stock</p>
                      <h4 className="text-2xl font-black text-white">{res.quantity} <span className="text-sm font-normal text-gray-400">{res.unit}</span></h4>
                    </div>
                    {res.threshold_quantity && res.quantity <= res.threshold_quantity && (
                      <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">LOW STOCK</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-6 flex-1 text-sm text-gray-400">
                  <div className="flex items-center gap-2"><MapPin size={14}/> Location: <span className="text-gray-300">{res.warehouse_location}</span></div>
                  <div className="flex items-center gap-2"><LayoutGrid size={14}/> Updated: <span className="text-gray-300">{new Date(res.last_updated || '').toLocaleDateString()}</span></div>
                </div>
                
                <div className="flex gap-2">
                  <button className="btn-glass flex-1 py-2">Add Stock</button>
                  <button className="btn-primary flex-1 py-2" style={{ background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)', borderColor: '#D97706' }}>Distribute</button>
                </div>
              </motion.div>
            ))}

            {activeTab === 'shelters' && shelters.length === 0 && (
               <div className="col-span-full text-center py-12 text-gray-500">
                 <Home className="w-12 h-12 mx-auto mb-3 opacity-30" />
                 <p>No shelters registered.</p>
               </div>
            )}

            {activeTab === 'resources' && resources.length === 0 && (
               <div className="col-span-full text-center py-12 text-gray-500">
                 <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                 <p>No resources found in inventory.</p>
               </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default ReliefPage
