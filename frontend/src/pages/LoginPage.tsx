import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, Mail, Lock, AlertCircle, Shield, Activity, Users, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {}
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email address'
    if (!form.password) newErrors.password = 'Password is required'
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)

    try {
      await login(form.email.trim().toLowerCase(), form.password)
      if (form.remember) {
        localStorage.setItem('resqai_remember', form.email)
      } else {
        localStorage.removeItem('resqai_remember')
      }
      toast.success('Welcome back! Redirecting...')
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Invalid credentials. Please try again.'
      toast.error(msg)
      setErrors({ password: msg })
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemo = (email: string, password: string) => {
    setForm(prev => ({ ...prev, email, password }))
    setErrors({})
  }

  const demoCredentials = [
    { label: 'Admin', email: 'admin@resqai.in', password: 'password123', color: '#EC4899' },
    { label: 'Rescue', email: 'rescue@resqai.in', password: 'password123', color: '#F97316' },
    { label: 'Volunteer', email: 'volunteer@resqai.in', password: 'password123', color: '#22C55E' },
    { label: 'Citizen', email: 'citizen@resqai.in', password: 'password123', color: '#3B82F6' },
  ]

  const featureHighlights = [
    { icon: Shield, label: 'AI Disaster Prediction', desc: '98% accuracy with ML models' },
    { icon: Activity, label: 'Real-time Response', desc: 'Track incidents live' },
    { icon: Users, label: 'Team Coordination', desc: 'Multi-role management' },
    { icon: Bell, label: 'Instant Alerts', desc: 'Multi-channel notifications' },
  ]

  return (
    <div className="min-h-screen flex" style={{ background: '#0B1220' }}>
      {/* ── LEFT: Branding Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col">
        {/* Background gradients */}
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #0B1220 0%, #0d1a2e 50%, #0B1220 100%)',
          }} />
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(0,212,255,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 70% 80%, rgba(139,92,246,0.08) 0%, transparent 50%)',
          }} />

        {/* Animated grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Floating orbs */}
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00D4FF, transparent)', filter: 'blur(40px)' }}
        />
        <motion.div
          animate={{ y: [0, 25, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)', filter: 'blur(40px)' }}
        />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">ResQAI</span>
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h1 className="text-4xl font-black text-white mb-4 leading-tight">
                Protecting Communities<br />
                <span className="gradient-text">Through AI</span>
              </h1>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                Sign in to access real-time disaster management tools, AI predictions, and
                coordinated emergency response capabilities.
              </p>

              {/* Feature Highlights */}
              <div className="space-y-4">
                {featureHighlights.map((f, i) => {
                  const Icon = f.icon
                  return (
                    <motion.div
                      key={f.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                        <Icon className="w-5 h-5" style={{ color: '#00D4FF' }} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{f.label}</div>
                        <div className="text-xs text-gray-500">{f.desc}</div>
                      </div>
                      <div className="ml-auto">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Bottom stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '10K+', label: 'Lives Saved' },
              { value: '98%', label: 'Accuracy' },
              { value: '50+', label: 'Cities' },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-xl font-black gradient-text">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">ResQAI</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2">Welcome back</h2>
            <p className="text-gray-400">Sign in to your ResQAI account</p>
          </div>

          {/* Demo Credentials */}
          <div className="mb-6 p-4 rounded-2xl"
            style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}>
            <p className="text-xs font-semibold text-gray-400 mb-3">
              <span style={{ color: '#00D4FF' }}>Demo accounts</span> — click to fill:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoCredentials.map((demo) => (
                <button
                  key={demo.label}
                  onClick={() => fillDemo(demo.email, demo.password)}
                  className="text-left px-3 py-2 rounded-xl text-xs transition-all duration-200 hover:scale-105"
                  style={{
                    background: `${demo.color}12`,
                    border: `1px solid ${demo.color}30`,
                  }}
                >
                  <div className="font-semibold" style={{ color: demo.color }}>{demo.label}</div>
                  <div className="text-gray-500 truncate">{demo.email}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5"
                  style={{ color: errors.email ? '#EF4444' : '#6B7280', width: 18, height: 18 }}
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: undefined })) }}
                  placeholder="you@example.com"
                  className="input-dark pl-10"
                  style={{
                    borderColor: errors.email ? '#EF4444' : undefined,
                  }}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-xs flex items-center gap-1"
                  style={{ color: '#EF4444' }}
                >
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <a href="#" className="text-xs transition-colors hover:text-white" style={{ color: '#00D4FF' }}>
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: errors.password ? '#EF4444' : '#6B7280', width: 18, height: 18 }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: undefined })) }}
                  placeholder="Enter your password"
                  className="input-dark pl-10 pr-10"
                  style={{ borderColor: errors.password ? '#EF4444' : undefined }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-xs flex items-center gap-1"
                  style={{ color: '#EF4444' }}
                >
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </motion.p>
              )}
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={e => setForm(p => ({ ...p, remember: e.target.checked }))}
                  className="sr-only"
                />
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200"
                  style={{
                    background: form.remember ? 'linear-gradient(135deg, #00D4FF, #3B82F6)' : 'rgba(255,255,255,0.06)',
                    border: form.remember ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  {form.remember && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                Remember me for 30 days
              </span>
            </label>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.01 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: isLoading
                  ? 'rgba(0,212,255,0.5)'
                  : 'linear-gradient(135deg, #00D4FF 0%, #3B82F6 100%)',
                boxShadow: isLoading ? 'none' : '0 8px 25px rgba(0,212,255,0.3)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                  />
                  Signing in...
                </>
              ) : (
                'Sign In to ResQAI'
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs text-gray-600">New to ResQAI?</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Register link */}
          <Link
            to="/register"
            className="block w-full py-3.5 rounded-xl font-semibold text-center text-sm transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
            }}
          >
            Create a free account
          </Link>

          <p className="text-center text-xs text-gray-600 mt-6">
            By signing in, you agree to our{' '}
            <a href="#" className="underline hover:text-gray-400 transition-colors">Terms</a>
            {' '}and{' '}
            <a href="#" className="underline hover:text-gray-400 transition-colors">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default LoginPage
