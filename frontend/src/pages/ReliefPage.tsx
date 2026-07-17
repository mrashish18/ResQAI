import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Package, Plus, MapPin, Users, Phone, LayoutGrid, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { sheltersAPI, resourcesAPI } from '../lib/api'
import type { Shelter, Resource } from '../types'
import toast from 'react-hot-toast'

const ReliefPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shelters' | 'resources'>('shelters')
  const [shelters, setShelters] = useState<Shelter[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [showAddShelterModal, setShowAddShelterModal] = useState(false)
  const [showAddResourceModal, setShowAddResourceModal] = useState(false)
  const [showDistributeModal, setShowDistributeModal] = useState(false)
  const [showUpdateStockModal, setShowUpdateStockModal] = useState(false)
  const [showUpdateCapacityModal, setShowUpdateCapacityModal] = useState(false)

  // Selection states for actions
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null)

  // Form states
  const [shelterForm, setShelterForm] = useState({ name: '', address: '', latitude: '', longitude: '', capacity: '', contact: '' })
  const [resourceForm, setResourceForm] = useState({ name: '', category: 'food', quantity: '', unit: '', warehouse_location: '' })
  const [distributeForm, setDistributeForm] = useState({ quantity: '', distributed_to: '' })
  const [stockForm, setStockForm] = useState({ quantity: '' })
  const [capacityForm, setCapacityForm] = useState({ current_occupancy: '', capacity: '' })

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

  // --- Add Shelter Submit ---
  const handleAddShelterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shelterForm.name || !shelterForm.address || !shelterForm.latitude || !shelterForm.longitude || !shelterForm.capacity) {
      toast.error("Please fill in all required fields")
      return
    }
    try {
      await sheltersAPI.create({
        name: shelterForm.name,
        address: shelterForm.address,
        latitude: parseFloat(shelterForm.latitude),
        longitude: parseFloat(shelterForm.longitude),
        capacity: parseInt(shelterForm.capacity),
        contact: shelterForm.contact || undefined
      })
      toast.success("Shelter registered successfully")
      setShowAddShelterModal(false)
      setShelterForm({ name: '', address: '', latitude: '', longitude: '', capacity: '', contact: '' })
      fetchData()
    } catch (error) {
      toast.error("Failed to create shelter")
    }
  }

  // --- Add Resource Submit ---
  const handleAddResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resourceForm.name || !resourceForm.quantity || !resourceForm.unit || !resourceForm.warehouse_location) {
      toast.error("Please fill in all required fields")
      return
    }
    try {
      await resourcesAPI.create({
        name: resourceForm.name,
        category: resourceForm.category,
        quantity: parseFloat(resourceForm.quantity),
        unit: resourceForm.unit,
        warehouse_location: resourceForm.warehouse_location
      })
      toast.success("Resource stock registered")
      setShowAddResourceModal(false)
      setResourceForm({ name: '', category: 'food', quantity: '', unit: '', warehouse_location: '' })
      fetchData()
    } catch (error) {
      toast.error("Failed to register resource")
    }
  }

  // --- Distribute Resource Submit ---
  const handleDistributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedResource) return
    const qty = parseFloat(distributeForm.quantity)
    if (!qty || qty <= 0 || !distributeForm.distributed_to) {
      toast.error("Please provide valid quantity and destination")
      return
    }
    try {
      await resourcesAPI.distribute({
        resource_id: selectedResource.id,
        quantity: qty,
        distributed_to: distributeForm.distributed_to
      })
      toast.success("Resource successfully distributed")
      setShowDistributeModal(false)
      setDistributeForm({ quantity: '', distributed_to: '' })
      fetchData()
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Failed to distribute resource"
      toast.error(msg)
    }
  }

  // --- Add Stock Submit ---
  const handleAddStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedResource) return
    const qty = parseFloat(stockForm.quantity)
    if (isNaN(qty) || qty < 0) {
      toast.error("Please enter a valid stock quantity")
      return
    }
    try {
      await resourcesAPI.update(selectedResource.id, {
        quantity: selectedResource.quantity + qty
      })
      toast.success("Stock inventory updated")
      setShowUpdateStockModal(false)
      setStockForm({ quantity: '' })
      fetchData()
    } catch (error) {
      toast.error("Failed to update stock")
    }
  }

  // --- Update Capacity Submit ---
  const handleUpdateCapacitySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShelter) return
    const occ = parseInt(capacityForm.current_occupancy)
    const cap = parseInt(capacityForm.capacity)
    if (isNaN(occ) || isNaN(cap) || occ < 0 || cap <= 0) {
      toast.error("Please enter valid numeric capacity values")
      return
    }
    try {
      await sheltersAPI.update(selectedShelter.id, {
        current_occupancy: occ,
        capacity: cap
      })
      toast.success("Shelter capacity details updated")
      setShowUpdateCapacityModal(false)
      setCapacityForm({ current_occupancy: '', capacity: '' })
      fetchData()
    } catch (error) {
      toast.error("Failed to update capacity details")
    }
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
            <button 
              onClick={() => activeTab === 'shelters' ? setShowAddShelterModal(true) : setShowAddResourceModal(true)} 
              className="btn-primary flex items-center gap-2"
            >
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
                  <button 
                    onClick={() => {
                      setSelectedShelter(shelter)
                      setCapacityForm({ current_occupancy: shelter.current_occupancy.toString(), capacity: shelter.capacity.toString() })
                      setShowUpdateCapacityModal(true)
                    }} 
                    className="btn-glass w-full py-2"
                  >
                    Update Capacity
                  </button>
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
                    {res.quantity <= (res.quantity * 0.1) && ( // simple low stock metric
                      <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded">LOW STOCK</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-6 flex-1 text-sm text-gray-400">
                  <div className="flex items-center gap-2"><MapPin size={14}/> Location: <span className="text-gray-300">{res.warehouse_location}</span></div>
                  <div className="flex items-center gap-2"><LayoutGrid size={14}/> Updated: <span className="text-gray-300">{new Date(res.last_updated || '').toLocaleDateString()}</span></div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedResource(res)
                      setShowUpdateStockModal(true)
                    }} 
                    className="btn-glass flex-1 py-2"
                  >
                    Add Stock
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedResource(res)
                      setDistributeForm({ quantity: '', distributed_to: '' })
                      setShowDistributeModal(true)
                    }}
                    className="btn-primary flex-1 py-2" 
                    style={{ background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)', borderColor: '#D97706' }}
                  >
                    Distribute
                  </button>
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

      {/* --- MODAL SYSTEM --- */}
      <AnimatePresence>
        {/* Add Shelter Modal */}
        {showAddShelterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card p-6 max-w-md w-full mx-4 border border-white/10 relative">
              <button onClick={() => setShowAddShelterModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={18}/></button>
              <h3 className="text-xl font-bold text-white mb-4">Register Shelter</h3>
              <form onSubmit={handleAddShelterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Shelter Name</label>
                  <input type="text" value={shelterForm.name} onChange={e => setShelterForm({...shelterForm, name: e.target.value})} className="input-field w-full" placeholder="e.g. Nehru Stadium Relief Camp" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Address</label>
                  <input type="text" value={shelterForm.address} onChange={e => setShelterForm({...shelterForm, address: e.target.value})} className="input-field w-full" placeholder="Full address details" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Latitude</label>
                    <input type="number" step="any" value={shelterForm.latitude} onChange={e => setShelterForm({...shelterForm, latitude: e.target.value})} className="input-field w-full" placeholder="e.g. 20.27" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Longitude</label>
                    <input type="number" step="any" value={shelterForm.longitude} onChange={e => setShelterForm({...shelterForm, longitude: e.target.value})} className="input-field w-full" placeholder="e.g. 85.84" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Capacity</label>
                    <input type="number" value={shelterForm.capacity} onChange={e => setShelterForm({...shelterForm, capacity: e.target.value})} className="input-field w-full" placeholder="e.g. 500" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Contact Phone</label>
                    <input type="text" value={shelterForm.contact} onChange={e => setShelterForm({...shelterForm, contact: e.target.value})} className="input-field w-full" placeholder="+91-XXXXX" />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-2" style={{ background: 'linear-gradient(90deg, #22C55E 0%, #15803D 100%)', borderColor: '#15803D' }}>Save Shelter</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Resource Modal */}
        {showAddResourceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card p-6 max-w-md w-full mx-4 border border-white/10 relative">
              <button onClick={() => setShowAddResourceModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={18}/></button>
              <h3 className="text-xl font-bold text-white mb-4">Register Inventory Resource</h3>
              <form onSubmit={handleAddResourceSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Item Name</label>
                  <input type="text" value={resourceForm.name} onChange={e => setResourceForm({...resourceForm, name: e.target.value})} className="input-field w-full" placeholder="e.g. Rice bags, Chlorine tablets" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Category</label>
                  <select value={resourceForm.category} onChange={e => setResourceForm({...resourceForm, category: e.target.value})} className="input-field w-full">
                    <option value="food">Food</option>
                    <option value="water">Water</option>
                    <option value="medicine">Medicine</option>
                    <option value="blankets">Blankets</option>
                    <option value="vehicles">Vehicles</option>
                    <option value="equipment">Equipment</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Initial Quantity</label>
                    <input type="number" step="any" value={resourceForm.quantity} onChange={e => setResourceForm({...resourceForm, quantity: e.target.value})} className="input-field w-full" placeholder="e.g. 1000" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Unit</label>
                    <input type="text" value={resourceForm.unit} onChange={e => setResourceForm({...resourceForm, unit: e.target.value})} className="input-field w-full" placeholder="e.g. kg, liters, units" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Warehouse Location</label>
                  <input type="text" value={resourceForm.warehouse_location} onChange={e => setResourceForm({...resourceForm, warehouse_location: e.target.value})} className="input-field w-full" placeholder="Warehouse address details" required />
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-2" style={{ background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)', borderColor: '#D97706' }}>Save Resource</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Distribute Modal */}
        {showDistributeModal && selectedResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card p-6 max-w-md w-full mx-4 border border-white/10 relative">
              <button onClick={() => setShowDistributeModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={18}/></button>
              <h3 className="text-xl font-bold text-white mb-2">Distribute Resource</h3>
              <p className="text-xs text-gray-400 mb-4">Stock available: {selectedResource.quantity} {selectedResource.unit}</p>
              <form onSubmit={handleDistributeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Quantity to Send</label>
                  <input type="number" step="any" max={selectedResource.quantity} value={distributeForm.quantity} onChange={e => setDistributeForm({...distributeForm, quantity: e.target.value})} className="input-field w-full" placeholder={`Max ${selectedResource.quantity}`} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Destination Center / Shelter</label>
                  <input type="text" value={distributeForm.distributed_to} onChange={e => setDistributeForm({...distributeForm, distributed_to: e.target.value})} className="input-field w-full" placeholder="e.g. St. Thomas Shelter" required />
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-2" style={{ background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)', borderColor: '#D97706' }}>Confirm Dispatch</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Stock Modal */}
        {showUpdateStockModal && selectedResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card p-6 max-w-md w-full mx-4 border border-white/10 relative">
              <button onClick={() => setShowUpdateStockModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={18}/></button>
              <h3 className="text-xl font-bold text-white mb-2">Add Stock Inventory</h3>
              <p className="text-xs text-gray-400 mb-4">Current inventory level: {selectedResource.quantity} {selectedResource.unit}</p>
              <form onSubmit={handleAddStockSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Restock Quantity</label>
                  <input type="number" step="any" value={stockForm.quantity} onChange={e => setStockForm({...stockForm, quantity: e.target.value})} className="input-field w-full" placeholder="Enter amount to add" required />
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-2" style={{ background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)', borderColor: '#D97706' }}>Update Stock</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Update Capacity Modal */}
        {showUpdateCapacityModal && selectedShelter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card p-6 max-w-md w-full mx-4 border border-white/10 relative">
              <button onClick={() => setShowUpdateCapacityModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={18}/></button>
              <h3 className="text-xl font-bold text-white mb-4">Update Capacity Details</h3>
              <form onSubmit={handleUpdateCapacitySubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Current Occupancy</label>
                    <input type="number" value={capacityForm.current_occupancy} onChange={e => setCapacityForm({...capacityForm, current_occupancy: e.target.value})} className="input-field w-full" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Max Capacity</label>
                    <input type="number" value={capacityForm.capacity} onChange={e => setCapacityForm({...capacityForm, capacity: e.target.value})} className="input-field w-full" required />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-2" style={{ background: 'linear-gradient(90deg, #22C55E 0%, #15803D 100%)', borderColor: '#15803D' }}>Apply Changes</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ReliefPage
