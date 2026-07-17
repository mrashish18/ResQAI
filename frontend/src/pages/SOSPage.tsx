import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, MapPin, Camera, CheckCircle2, ShieldAlert } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { sosAPI, uploadsAPI } from '../lib/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const SOSPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [form, setForm] = useState({
    incident_type: 'flood',
    severity: 'high',
    latitude: '',
    longitude: '',
    description: '',
    people_count: '1',
    medical_emergency: false,
    image: null as File | null
  })

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }))
          toast.success("Location acquired!")
        },
        () => {
          toast.error("Unable to retrieve location.")
        }
      )
    } else {
      toast.error("Geolocation is not supported by your browser.")
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm(prev => ({ ...prev, image: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.latitude || !form.longitude || !form.description) {
      toast.error("Please fill in required fields (Location & Description)")
      return
    }

    setLoading(true)
    try {
      let imageUrl: string | undefined = undefined
      if (form.image) {
        try {
          const uploadRes = await uploadsAPI.uploadImage(form.image, 'sos')
          imageUrl = uploadRes.data.file_url
        } catch (uploadError) {
          console.error("Image upload failed, submitting SOS without image", uploadError)
        }
      }

      await sosAPI.create({
        incident_type: form.incident_type,
        severity: form.severity,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        description: form.description,
        people_count: parseInt(form.people_count) || 1,
        medical_emergency: form.medical_emergency,
        image_url: imageUrl
      })
      setSuccess(true)
      toast.success("SOS Alert Broadcasted!")
    } catch (error) {
      toast.error("Failed to send SOS. Please call 112 directly.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0B1220' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto p-8 flex justify-center items-center">
        {success ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-10 max-w-md w-full text-center" style={{ border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">SOS Sent</h2>
            <p className="text-gray-400 mb-8">Rescue teams have been notified of your location. Stay calm and wait for assistance.</p>
            <button onClick={() => navigate('/dashboard')} className="btn-glass w-full">Return to Dashboard</button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-black text-white mb-2 flex items-center justify-center gap-3">
                <ShieldAlert className="text-red-500 w-10 h-10" /> 
                <span className="text-red-500">Emergency SOS</span>
              </h1>
              <p className="text-gray-400 text-lg">Send your exact location to immediate responders.</p>
            </div>

            <div className="glass-card p-8 relative overflow-hidden" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              {/* Emergency styling backdrop */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-500"></div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Disaster Type</label>
                    <select 
                      className="input-field w-full bg-[#1E293B] border-red-900/30 text-white" 
                      value={form.incident_type} 
                      onChange={e => setForm({...form, incident_type: e.target.value})}
                    >
                      <option value="flood">Flood</option>
                      <option value="earthquake">Earthquake</option>
                      <option value="cyclone">Cyclone</option>
                      <option value="wildfire">Wildfire</option>
                      <option value="tsunami">Tsunami</option>
                      <option value="landslide">Landslide</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Severity</label>
                    <select 
                      className="input-field w-full bg-[#1E293B] border-red-900/30 text-white" 
                      value={form.severity} 
                      onChange={e => setForm({...form, severity: e.target.value})}
                    >
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-red-900/10 rounded-xl border border-red-900/30">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-bold text-white">Your Location (Required)</label>
                    <button type="button" onClick={handleGetLocation} className="btn-glass text-xs flex items-center gap-2 border-red-500/30 hover:bg-red-500/20 text-white">
                      <MapPin className="w-4 h-4 text-red-400" /> Auto-Locate
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="number" step="any" className="input-field w-full" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} placeholder="Latitude (e.g. 19.0760)" required />
                    <input type="number" step="any" className="input-field w-full" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} placeholder="Longitude (e.g. 72.8777)" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Description of Situation</label>
                  <textarea 
                    className="input-field w-full h-24" 
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})} 
                    placeholder="Describe your surroundings, injuries, and immediate needs..." 
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Number of People Trapped</label>
                    <input type="number" min="1" className="input-field w-full" value={form.people_count} onChange={e => setForm({...form, people_count: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Photo Proof (Optional)</label>
                    <label className="input-field w-full flex items-center justify-center cursor-pointer border-dashed border-2 hover:bg-[#1E293B]/80 transition">
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      <div className="flex items-center gap-2 text-gray-400">
                        <Camera className="w-5 h-5" /> {form.image ? form.image.name : 'Tap to Upload Image'}
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-red-900/20 rounded-xl border border-red-500/30">
                  <input 
                    type="checkbox" 
                    id="medical" 
                    className="w-5 h-5 accent-red-500 rounded cursor-pointer"
                    checked={form.medical_emergency}
                    onChange={e => setForm({...form, medical_emergency: e.target.checked})}
                  />
                  <label htmlFor="medical" className="text-white font-semibold cursor-pointer select-none">
                    Immediate Medical Attention Required
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><AlertCircle className="w-6 h-6" /> BROADCAST SOS</>}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default SOSPage
