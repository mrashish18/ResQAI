import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Key, Mail, Phone, Shield } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../lib/api'
import toast from 'react-hot-toast'

const ProfilePage: React.FC = () => {
  const { user } = useAuth()
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.old_password || !form.new_password || !form.confirm_password) {
      toast.error("Please fill in all fields")
      return
    }
    if (form.new_password.length < 6) {
      toast.error("New password must be at least 6 characters")
      return
    }
    if (form.new_password !== form.confirm_password) {
      toast.error("New passwords do not match")
      return
    }
    setLoading(true)
    try {
      await authAPI.changePassword(form.old_password, form.new_password)
      toast.success("Password changed successfully")
      setForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Failed to change password"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0B1220' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-black text-white mb-1">My <span className="gradient-text">Profile</span></h1>
          <p className="text-gray-400">Manage your profile, roles, and account security details.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* User Info Card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 border-t-4 border-[#00D4FF]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold font-black text-white" style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}>
                {user?.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{user?.full_name}</h3>
                <span className="text-sm font-semibold capitalize text-[#00D4FF] bg-[#00D4FF]/10 px-3 py-0.5 rounded-full border border-[#00D4FF]/30 mt-1 inline-block">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <div className="flex items-center gap-4 text-gray-300">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0 border border-white/5"><Mail size={18} className="text-gray-400" /></div>
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">Email Address</p>
                  <p className="text-sm font-medium text-white">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-300">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0 border border-white/5"><Phone size={18} className="text-gray-400" /></div>
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">Phone Number</p>
                  <p className="text-sm font-medium text-white">{user?.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-300">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0 border border-white/5"><Shield size={18} className="text-gray-400" /></div>
                <div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">Account Status</p>
                  <p className="text-sm font-medium text-green-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Active Verified
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Change Password Card */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 border-t-4 border-[#8B5CF6]">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Key className="text-[#8B5CF6]"/> Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Current Password</label>
                <input type="password" value={form.old_password} onChange={e => setForm({...form, old_password: e.target.value})} className="input-field w-full" placeholder="Enter your current password" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">New Password</label>
                <input type="password" value={form.new_password} onChange={e => setForm({...form, new_password: e.target.value})} className="input-field w-full" placeholder="At least 6 characters" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Confirm New Password</label>
                <input type="password" value={form.confirm_password} onChange={e => setForm({...form, confirm_password: e.target.value})} className="input-field w-full" placeholder="Re-enter your new password" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-4" style={{ background: 'linear-gradient(90deg, #8B5CF6 0%, #7C3AED 100%)', borderColor: '#7C3AED' }}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage
