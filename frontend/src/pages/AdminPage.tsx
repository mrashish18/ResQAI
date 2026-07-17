import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Users, Activity, Settings, Edit2, Trash2, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { usersAPI, adminAPI, authAPI } from '../lib/api'
import type { User } from '../types'
import toast from 'react-hot-toast'

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  // Selection states
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Form states
  const [addForm, setAddForm] = useState({ email: '', full_name: '', password: '', role: 'citizen', phone: '' })
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', role: 'citizen', is_active: true })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, statsRes] = await Promise.all([
        usersAPI.list(),
        adminAPI.systemStats()
      ])
      setUsers(usersRes.data)
      setStats(statsRes.data)
    } catch (error) {
      toast.error("Failed to load admin data")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return
    try {
      await usersAPI.delete(id)
      setUsers(users.filter(u => u.id !== id))
      toast.success("User deleted")
    } catch (error) {
      toast.error("Failed to delete user")
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.email || !addForm.full_name || !addForm.password) {
      toast.error("Please fill in required fields")
      return
    }
    try {
      // call authAPI register directly without updating current session context
      await authAPI.register({
        email: addForm.email,
        full_name: addForm.full_name,
        password: addForm.password,
        role: addForm.role as any,
        phone: addForm.phone || undefined
      })
      toast.success("User account created")
      setShowAddModal(false)
      setAddForm({ email: '', full_name: '', password: '', role: 'citizen', phone: '' })
      fetchData()
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Failed to create user"
      toast.error(msg)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    try {
      await usersAPI.update(selectedUser.id, {
        full_name: editForm.full_name,
        phone: editForm.phone || undefined,
        role: editForm.role as any,
        is_active: editForm.is_active
      })
      toast.success("User profile updated")
      setShowEditModal(false)
      fetchData()
    } catch (error) {
      toast.error("Failed to update user")
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0B1220' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-white mb-1"><span className="gradient-text">Admin</span> Console</h1>
            <p className="text-gray-400">Manage users, system configurations, and view platform health.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm py-2.5 px-5">Add User</button>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-10 h-10 border-4 border-[#00D4FF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 flex items-center gap-4 border-t-4 border-[#3B82F6]">
                <div className="bg-blue-500/20 p-4 rounded-xl"><Users className="w-8 h-8 text-blue-400" /></div>
                <div>
                  <p className="text-gray-400 text-sm font-semibold">Total Users</p>
                  <h3 className="text-2xl font-bold text-white">{stats?.total_users || users.length}</h3>
                </div>
              </div>
              <div className="glass-card p-6 flex items-center gap-4 border-t-4 border-[#10B981]">
                <div className="bg-green-500/20 p-4 rounded-xl"><Activity className="w-8 h-8 text-green-400" /></div>
                <div>
                  <p className="text-gray-400 text-sm font-semibold">System Health</p>
                  <h3 className="text-2xl font-bold text-white">{stats?.health_status || '99.9% Uptime'}</h3>
                </div>
              </div>
              <div className="glass-card p-6 flex items-center gap-4 border-t-4 border-[#8B5CF6]">
                <div className="bg-purple-500/20 p-4 rounded-xl"><ShieldCheck className="w-8 h-8 text-purple-400" /></div>
                <div>
                  <p className="text-gray-400 text-sm font-semibold">Active Admins</p>
                  <h3 className="text-2xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</h3>
                </div>
              </div>
            </div>

            {/* User Management Table */}
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0F172A]/50">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Settings className="w-5 h-5 text-[#00D4FF]" /> User Management</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1E293B]/50 text-gray-400 text-sm uppercase tracking-wider">
                      <th className="p-4 font-semibold border-b border-gray-800">Name</th>
                      <th className="p-4 font-semibold border-b border-gray-800">Email</th>
                      <th className="p-4 font-semibold border-b border-gray-800">Role</th>
                      <th className="p-4 font-semibold border-b border-gray-800">Status</th>
                      <th className="p-4 font-semibold border-b border-gray-800 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-gray-800/50 hover:bg-[#1E293B]/30 transition-colors">
                        <td className="p-4 text-white font-medium">{user.full_name}</td>
                        <td className="p-4 text-gray-400">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-300'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`flex items-center gap-2 text-sm ${user.is_active ? 'text-green-400' : 'text-red-400'}`}>
                            <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {user.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="p-4 flex justify-end gap-2">
                          <button 
                            onClick={() => {
                              setSelectedUser(user)
                              setEditForm({ full_name: user.full_name, phone: user.phone || '', role: user.role, is_active: user.is_active })
                              setShowEditModal(true)
                            }}
                            className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteUser(user.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL SYSTEM --- */}
      <AnimatePresence>
        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card p-6 max-w-md w-full mx-4 border border-white/10 relative">
              <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={18}/></button>
              <h3 className="text-xl font-bold text-white mb-4">Create User Account</h3>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Full Name</label>
                  <input type="text" value={addForm.full_name} onChange={e => setAddForm({...addForm, full_name: e.target.value})} className="input-field w-full" placeholder="e.g. Lakshman Rao" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
                  <input type="email" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} className="input-field w-full" placeholder="name@resqai.in" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Temporary Password</label>
                  <input type="password" value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})} className="input-field w-full" placeholder="Min 6 characters" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">System Role</label>
                    <select value={addForm.role} onChange={e => setAddForm({...addForm, role: e.target.value})} className="input-field w-full">
                      <option value="citizen">Citizen</option>
                      <option value="rescue_team">Rescue Team</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="ngo">NGO Member</option>
                      <option value="government">Government Official</option>
                      <option value="admin">System Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number</label>
                    <input type="text" value={addForm.phone} onChange={e => setAddForm({...addForm, phone: e.target.value})} className="input-field w-full" placeholder="+91-XXXXX" />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-2" style={{ background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)', borderColor: '#2563EB' }}>Create Account</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card p-6 max-w-md w-full mx-4 border border-white/10 relative">
              <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={18}/></button>
              <h3 className="text-xl font-bold text-white mb-2">Edit User Profile</h3>
              <p className="text-xs text-gray-400 mb-4">Editing details for {selectedUser.email}</p>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Full Name</label>
                  <input type="text" value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} className="input-field w-full" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number</label>
                  <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="input-field w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">System Role</label>
                    <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="input-field w-full">
                      <option value="citizen">Citizen</option>
                      <option value="rescue_team">Rescue Team</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="ngo">NGO Member</option>
                      <option value="government">Government Official</option>
                      <option value="admin">System Admin</option>
                    </select>
                  </div>
                  <div className="flex flex-col justify-end pb-1">
                    <label className="flex items-center gap-2 text-sm text-white font-semibold cursor-pointer">
                      <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm({...editForm, is_active: e.target.checked})} className="w-5 h-5 rounded accent-[#00D4FF]" />
                      Account Active
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-2">Save Updates</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminPage
