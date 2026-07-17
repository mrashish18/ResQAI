import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Users, Activity, Settings, Edit2, Trash2 } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { adminAPI } from '../lib/api'
import type { User } from '../types'
import toast from 'react-hot-toast'

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, statsRes] = await Promise.all([
        adminAPI.users(),
        adminAPI.systemStats()
      ])
      setUsers(usersRes.data.items || usersRes.data) // fallback if not paginated
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
      await adminAPI.deleteUser(id)
      setUsers(users.filter(u => u.id !== id))
      toast.success("User deleted")
    } catch (error) {
      toast.error("Failed to delete user")
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0B1220' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-black text-white mb-1"><span className="gradient-text">Admin</span> Console</h1>
          <p className="text-gray-400">Manage users, system configurations, and view platform health.</p>
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
                <button className="btn-primary text-sm py-2 px-4">Add User</button>
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
                          <button className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded transition"><Edit2 size={16} /></button>
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
    </div>
  )
}

export default AdminPage
