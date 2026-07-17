import React, { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye, EyeOff, Zap, Mail, Lock, User, Phone, ChevronDown,
  AlertCircle, CheckCircle, Shield, Activity, Users, Globe
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'
import toast from 'react-hot-toast'

interface FormData {
  full_name: string
  email: string
  password: string
  confirm_password: string
  role: UserRole
  phone: string
  terms: boolean
}

interface FormErrors {
  full_name?: string
  email?: string
  password?: string
  confirm_password?: string
  phone?: string
  terms?: string
}

const roles: { value: UserRole; label: string; desc: string; color: string }[] = [
  { value: 'citizen', label: 'Citizen', desc: 'Report incidents & find shelters', color: '#3B82F6' },
  { value: 'volunteer', label: 'Volunteer', desc: 'Help in rescue & relief ops', color: '#22C55E' },
  { value: 'rescue_team', label: 'Rescue Team', desc: 'Lead rescue operations', color: '#F97316' },
  { value: 'ngo', label: 'NGO', desc: 'Manage relief distribution', color: '#8B5CF6' },
  { value: 'government', label: 'Government', desc: 'Policy & coordination', color: '#00D4FF' },
  { value: 'admin', label: 'Admin', desc: 'Full platform management', color: '#EC4899' },
]

const getStrength = (pwd: string): { score: number; label: string; color: string } => {
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++

  if (score <= 1) return { score, label: 'Very Weak', color: '#EF4444' }
  if (score === 2) return { score, label: 'Weak', color: '#F97316' }
  if (score === 3) return { score, label: 'Fair', color: '#EAB308' }
  if (score === 4) return { score, label: 'Strong', color: '#22C55E' }
  return { score: 5, label: 'Very Strong', color: '#00D4FF' }
}

const RegisterPage: React.FC = () => {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<FormData>({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'citizen',
    phone: '',
    terms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [roleOpen, setRoleOpen] = useState(false)
  const [step, setStep] = useState(1) // Multi-step: 1=personal, 2=account

  const strength = getStrength(form.password)

  const update = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(p => ({ ...p, [key]: value }))
    setErrors(p => ({ ...p, [key]: undefined }))
  }, [])

  const validateStep1 = (): boolean => {
    const errs: FormErrors = {}
    if (!form.full_name.trim()) errs.full_name = 'Full name is required'
    else if (form.full_name.trim().length < 2) errs.full_name = 'Name must be at least 2 characters'
    if (form.phone && !/^[+]?[\d\s\-()]{10,}$/.test(form.phone)) {
      errs.phone = 'Invalid phone number'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = (): boolean => {
    const errs: FormErrors = {}
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (!form.confirm_password) errs.confirm_password = 'Please confirm your password'
    else if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match'
    if (!form.terms) errs.terms = 'You must accept the terms to continue'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return
    setIsLoading(true)

    try {
      await register({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        phone: form.phone.trim() || undefined,
      })
      toast.success('Account created! Welcome to ResQAI 🎉')
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Registration failed. Please try again.'
      toast.error(msg)
      if (msg.toLowerCase().includes('email')) {
        setErrors({ email: msg })
        setStep(2)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const selectedRole = roles.find(r => r.value === form.role)!

  const featureHighlights = [
    { icon: Shield, label: 'Secure & Encrypted', desc: 'End-to-end data protection' },
    { icon: Activity, label: 'Real-time Updates', desc: 'Live incident monitoring' },
    { icon: Users, label: '10,000+ Users', desc: 'Active emergency network' },
    { icon: Globe, label: '50+ Cities', desc: 'Pan-India coverage' },
  ]

  return (
    <div className="min-h-screen flex" style={{ background: '#0B1220' }}>
      {/* ── LEFT: Branding ── */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col">
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #0B1220 0%, #0d1a2e 60%, #0B1220 100%)',
          }} />
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 40% 30%, rgba(59,130,246,0.1) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 60% 80%, rgba(0,212,255,0.08) 0%, transparent 50%)',
          }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Animated orbs */}
        <motion.div
          animate={{ y: [0, -25, 0], x: [0, 10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 left-1/3 w-56 h-56 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)', filter: 'blur(40px)' }}
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00D4FF, transparent)', filter: 'blur(40px)' }}
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

          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <h1 className="text-4xl font-black text-white mb-4 leading-tight">
                Join the Emergency<br />
                <span className="gradient-text">Response Network</span>
              </h1>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                Create your free account and become part of India's most advanced
                AI-powered disaster management platform.
              </p>

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
                        style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                        <Icon className="w-5 h-5" style={{ color: '#3B82F6' }} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{f.label}</div>
                        <div className="text-xs text-gray-500">{f.desc}</div>
                      </div>
                      <CheckCircle className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: '#22C55E' }} />
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Step progress */}
          <div className="p-4 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs text-gray-500 mb-3">Registration progress</p>
            <div className="flex items-center gap-3">
              {[1, 2].map((s) => (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                      style={{
                        background: step >= s
                          ? 'linear-gradient(135deg, #00D4FF, #3B82F6)'
                          : 'rgba(255,255,255,0.06)',
                        color: step >= s ? 'white' : '#6B7280',
                      }}
                    >
                      {step > s ? '✓' : s}
                    </div>
                    <span className="text-xs" style={{ color: step >= s ? 'white' : '#6B7280' }}>
                      {s === 1 ? 'Personal Info' : 'Account Setup'}
                    </span>
                  </div>
                  {s < 2 && (
                    <div className="flex-1 h-px"
                      style={{ background: step > s ? '#00D4FF' : 'rgba(255,255,255,0.1)' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 overflow-y-auto relative">
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
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-3xl font-black text-white">
                {step === 1 ? 'Create Account' : 'Account Setup'}
              </h2>
            </div>
            <p className="text-gray-400">
              {step === 1
                ? 'Start with your personal information'
                : 'Set up your login credentials'}
            </p>
            {/* Mobile step indicator */}
            <div className="flex items-center gap-2 mt-4 lg:hidden">
              {[1, 2].map(s => (
                <div
                  key={s}
                  className="h-1 flex-1 rounded-full transition-all duration-300"
                  style={{
                    background: step >= s
                      ? 'linear-gradient(to right, #00D4FF, #3B82F6)'
                      : 'rgba(255,255,255,0.1)',
                  }}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* ── STEP 1 ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" style={{ width: 18, height: 18 }} />
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={e => update('full_name', e.target.value)}
                      placeholder="John Doe"
                      className="input-dark pl-10"
                      style={{ borderColor: errors.full_name ? '#EF4444' : undefined }}
                    />
                  </div>
                  {errors.full_name && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
                      <AlertCircle className="w-3 h-3" /> {errors.full_name}
                    </motion.p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number <span className="text-gray-600">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" style={{ width: 18, height: 18 }} />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                      className="input-dark pl-10"
                      style={{ borderColor: errors.phone ? '#EF4444' : undefined }}
                    />
                  </div>
                  {errors.phone && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
                      <AlertCircle className="w-3 h-3" /> {errors.phone}
                    </motion.p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Your Role *</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setRoleOpen(!roleOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: `1px solid ${selectedRole.color}40`,
                        color: 'white',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-lg flex-shrink-0"
                          style={{ background: `${selectedRole.color}20`, border: `1px solid ${selectedRole.color}40` }}
                        />
                        <div>
                          <div className="text-sm font-semibold" style={{ color: selectedRole.color }}>
                            {selectedRole.label}
                          </div>
                          <div className="text-xs text-gray-500">{selectedRole.desc}</div>
                        </div>
                      </div>
                      <ChevronDown
                        className="w-4 h-4 text-gray-400 transition-transform duration-200"
                        style={{ transform: roleOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    </button>

                    <AnimatePresence>
                      {roleOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-0 right-0 top-full mt-2 z-50 glass-card overflow-hidden"
                          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          {roles.map((role) => (
                            <button
                              key={role.value}
                              type="button"
                              onClick={() => { update('role', role.value); setRoleOpen(false) }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-white/5"
                            >
                              <div
                                className="w-6 h-6 rounded-lg flex-shrink-0"
                                style={{ background: `${role.color}20`, border: `1px solid ${role.color}40` }}
                              />
                              <div className="flex-1">
                                <div className="text-sm font-semibold" style={{ color: role.color }}>
                                  {role.label}
                                </div>
                                <div className="text-xs text-gray-500">{role.desc}</div>
                              </div>
                              {form.role === role.value && (
                                <CheckCircle className="w-4 h-4" style={{ color: role.color }} />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={handleNext}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #00D4FF 0%, #3B82F6 100%)',
                    boxShadow: '0 8px 25px rgba(0,212,255,0.3)',
                  }}
                >
                  Continue →
                </motion.button>
              </motion.div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" style={{ width: 18, height: 18 }} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => update('email', e.target.value)}
                      placeholder="you@example.com"
                      className="input-dark pl-10"
                      style={{ borderColor: errors.email ? '#EF4444' : undefined }}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" style={{ width: 18, height: 18 }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => update('password', e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="input-dark pl-10 pr-10"
                      style={{ borderColor: errors.password ? '#EF4444' : undefined }}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {form.password && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="flex-1 h-1 rounded-full transition-all duration-300"
                            style={{
                              background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.1)',
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-xs" style={{ color: strength.color }}>
                        {strength.label} password
                      </p>
                    </motion.div>
                  )}

                  {errors.password && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
                      <AlertCircle className="w-3 h-3" /> {errors.password}
                    </motion.p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" style={{ width: 18, height: 18 }} />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirm_password}
                      onChange={e => update('confirm_password', e.target.value)}
                      placeholder="Re-enter your password"
                      className="input-dark pl-10 pr-10"
                      style={{
                        borderColor: errors.confirm_password
                          ? '#EF4444'
                          : form.confirm_password && form.password === form.confirm_password
                          ? '#22C55E'
                          : undefined,
                      }}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showConfirm ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                    </button>
                    {form.confirm_password && form.password === form.confirm_password && (
                      <CheckCircle className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#22C55E' }} />
                    )}
                  </div>
                  {errors.confirm_password && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
                      <AlertCircle className="w-3 h-3" /> {errors.confirm_password}
                    </motion.p>
                  )}
                </div>

                {/* Terms */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={form.terms}
                        onChange={e => { update('terms', e.target.checked); setErrors(p => ({ ...p, terms: undefined })) }}
                        className="sr-only"
                      />
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200"
                        style={{
                          background: form.terms ? 'linear-gradient(135deg, #00D4FF, #3B82F6)' : 'rgba(255,255,255,0.06)',
                          border: errors.terms ? '1px solid #EF4444' : form.terms ? 'none' : '1px solid rgba(255,255,255,0.15)',
                        }}
                      >
                        {form.terms && (
                          <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </motion.svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                      I agree to the{' '}
                      <a href="#" className="underline hover:text-white" style={{ color: '#00D4FF' }}>Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="underline hover:text-white" style={{ color: '#00D4FF' }}>Privacy Policy</a>
                    </span>
                  </label>
                  {errors.terms && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#EF4444' }}>
                      <AlertCircle className="w-3 h-3" /> {errors.terms}
                    </motion.p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3.5 rounded-xl font-semibold text-sm transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.7)',
                    }}
                  >
                    ← Back
                  </button>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={!isLoading ? { scale: 1.01 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                    className="flex-1 py-3.5 rounded-xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-2"
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
                        Creating account...
                      </>
                    ) : (
                      'Create Account 🎉'
                    )}
                  </motion.button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs text-gray-600">Already have an account?</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <Link
            to="/login"
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
            Sign in to existing account
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default RegisterPage
