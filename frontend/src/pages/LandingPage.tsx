import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Zap, Brain, AlertTriangle, Map, Users, Package, Home,
  Heart, Bell, BarChart3, MessageCircle, ArrowRight,
  ChevronDown, Shield,
  Star, CheckCircle, Globe, Award, TrendingUp, Activity
} from 'lucide-react'

/* ─── Particle Canvas ─────────────────────────────────────────── */
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  color: string
}

const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const colors = ['rgba(0,212,255', 'rgba(59,130,246', 'rgba(139,92,246']

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Create 100 particles
    particlesRef.current = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const particles = particlesRef.current

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(0,212,255,${0.08 * (1 - dist / 150)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color},${p.opacity})`
        ctx.fill()

        // Glow effect
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3)
        gradient.addColorStop(0, `${p.color},${p.opacity * 0.3})`)
        gradient.addColorStop(1, `${p.color},0)`)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      animFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="particle-canvas"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  )
}

/* ─── Animated Counter ──────────────────────────────────────────── */
const AnimatedCounter: React.FC<{ target: number; suffix?: string; duration?: number }> = ({
  target, suffix = '', duration = 2000
}) => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!inView || hasStarted.current) return
    hasStarted.current = true
    const startTime = Date.now()
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.floor(easeOut(progress) * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ─── Feature Data ───────────────────────────────────────────────── */
const features = [
  {
    icon: Brain, label: 'AI Disaster Prediction',
    desc: 'Machine learning models analyze weather patterns, seismic data, and historical incidents to predict disasters with 98% accuracy.',
    color: '#00D4FF', bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.2)',
  },
  {
    icon: AlertTriangle, label: 'SOS Emergency Reporting',
    desc: 'One-tap emergency reporting with GPS location, image upload, and instant notification to all nearby rescue teams.',
    color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)',
  },
  {
    icon: Map, label: 'Interactive Disaster Map',
    desc: 'Real-time visualization of all active incidents, shelters, rescue teams, and risk zones on an interactive map.',
    color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)',
  },
  {
    icon: Users, label: 'Rescue Coordination',
    desc: 'Seamlessly coordinate rescue teams, assign incidents, track field operations, and manage resources in real time.',
    color: '#22C55E', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)',
  },
  {
    icon: Package, label: 'Relief Distribution',
    desc: 'Smart inventory management with automated replenishment alerts and optimized distribution across affected areas.',
    color: '#F97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)',
  },
  {
    icon: Home, label: 'Shelter Locator',
    desc: 'Find nearest available shelters with real-time capacity data, amenities, and turn-by-turn navigation support.',
    color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)',
  },
  {
    icon: Heart, label: 'Volunteer Management',
    desc: 'Recruit, coordinate, and track volunteers with skill-based task assignment and real-time progress monitoring.',
    color: '#EC4899', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.2)',
  },
  {
    icon: Bell, label: 'Emergency Alerts',
    desc: 'Multi-channel emergency broadcasts via SMS, push, email, and in-app with geofenced targeting for affected areas.',
    color: '#EAB308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.2)',
  },
  {
    icon: BarChart3, label: 'Analytics Dashboard',
    desc: 'Comprehensive real-time analytics with trend analysis, performance KPIs, and exportable reports for decision makers.',
    color: '#14B8A6', bg: 'rgba(20,184,166,0.1)', border: 'rgba(20,184,166,0.2)',
  },
  {
    icon: MessageCircle, label: 'AI Chat Assistant',
    desc: 'Natural language interface for emergency guidance, resource queries, situation updates, and multi-language support.',
    color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.2)',
  },
]

const testimonials = [
  {
    name: 'Col. Rajesh Sharma',
    role: 'Disaster Response Coordinator, NDRF',
    avatar: 'R',
    quote: 'ResQAI has transformed how we respond to disasters. The AI prediction system gave us a 6-hour head start before the cyclone hit Chennai — we evacuated 12,000 people safely.',
    stars: 5,
    color: '#00D4FF',
  },
  {
    name: 'Dr. Priya Menon',
    role: 'Emergency Manager, Mumbai Municipal Corp.',
    avatar: 'P',
    quote: 'The coordination capabilities are unmatched. During the 2024 floods, we managed 47 simultaneous rescue operations from a single dashboard. Response time dropped by 65%.',
    stars: 5,
    color: '#3B82F6',
  },
  {
    name: 'Aisha Patel',
    role: 'Volunteer Lead, Red Cross India',
    avatar: 'A',
    quote: 'As a volunteer coordinator, the task management system is incredible. We deployed 2,000+ volunteers in 48 hours with zero miscommunication. This platform saves lives.',
    stars: 5,
    color: '#22C55E',
  },
]

const steps = [
  {
    number: '01', title: 'Report Incident',
    desc: 'Citizens and field teams report emergencies via app, SMS, or web with automatic location tagging.',
    icon: AlertTriangle, color: '#EF4444',
  },
  {
    number: '02', title: 'AI Analyzes',
    desc: 'Our AI engine processes the report, assesses severity, predicts impact area, and identifies optimal response.',
    icon: Brain, color: '#00D4FF',
  },
  {
    number: '03', title: 'Response Deployed',
    desc: 'Rescue teams are auto-assigned, resources allocated, shelters activated, and real-time tracking begins.',
    icon: Shield, color: '#22C55E',
  },
]

/* ─── Landing Page ───────────────────────────────────────────────── */
const LandingPage: React.FC = () => {
  const featuresRef = useRef<HTMLElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
  }

  return (
    <div className="min-h-screen" style={{ background: '#0B1220' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 h-16"
        style={{
          background: 'rgba(11,18,32,0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold gradient-text">ResQAI</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button onClick={scrollToFeatures} className="text-sm text-gray-400 hover:text-white transition-colors">Features</button>
          <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How It Works</a>
          <a href="#testimonials" className="text-sm text-gray-400 hover:text-white transition-colors">Testimonials</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2">
            Sign In
          </Link>
          <Link to="/register"
            className="text-sm font-semibold px-5 py-2 rounded-xl text-white"
            style={{
              background: 'linear-gradient(135deg, #00D4FF, #3B82F6)',
              boxShadow: '0 4px 15px rgba(0,212,255,0.3)',
            }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16 hero-gradient">
        <ParticleCanvas />

        {/* Mouse-tracking gradient orb */}
        <div
          className="pointer-events-none fixed w-96 h-96 rounded-full opacity-20 transition-all duration-300"
          style={{
            background: 'radial-gradient(circle, rgba(0,212,255,0.4) 0%, transparent 70%)',
            left: mousePos.x - 192,
            top: mousePos.y - 192,
            zIndex: 1,
          }}
        />

        {/* Large radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, rgba(59,130,246,0.05) 40%, transparent 70%)',
            filter: 'blur(40px)',
            zIndex: 1,
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.2)',
            }}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full"
              style={{ background: '#00D4FF' }}
            />
            <Zap className="w-3.5 h-3.5" style={{ color: '#00D4FF' }} />
            <span className="text-xs font-semibold" style={{ color: '#00D4FF' }}>
              Powered by Advanced AI
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6"
          >
            <span className="text-white">AI-Powered</span>
            <br />
            <span
              className="animate-gradient"
              style={{
                background: 'linear-gradient(135deg, #00D4FF 0%, #3B82F6 40%, #8B5CF6 70%, #00D4FF 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Disaster Response
            </span>
            <br />
            <span className="text-white">Platform</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            ResQAI combines cutting-edge AI, real-time data, and coordinated response tools to protect
            communities before, during, and after disasters.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base"
                style={{
                  background: 'linear-gradient(135deg, #00D4FF 0%, #3B82F6 100%)',
                  boxShadow: '0 8px 30px rgba(0,212,255,0.35)',
                }}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button
                onClick={scrollToFeatures}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base btn-glass"
              >
                <Activity className="w-5 h-5" style={{ color: '#00D4FF' }} />
                Explore Features
              </button>
            </motion.div>
          </motion.div>

          {/* Floating Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {[
              { value: 10000, suffix: '+', label: 'Lives Saved', icon: Heart, color: '#EF4444' },
              { value: 500, suffix: '+', label: 'Incidents Managed', icon: AlertTriangle, color: '#F97316' },
              { value: 98, suffix: '%', label: 'AI Accuracy', icon: Brain, color: '#00D4FF' },
              { value: 50, suffix: '+', label: 'Cities Covered', icon: Globe, color: '#22C55E' },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
                  className="glass-card p-4 text-center"
                  style={{ border: `1px solid ${stat.color}20` }}
                >
                  <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: stat.color }} />
                  <div className="text-2xl font-black text-white">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-10"
          onClick={scrollToFeatures}
        >
          <span className="text-xs text-gray-500">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section ref={featuresRef} id="features" className="py-24 px-6 relative">
        {/* Section bg glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24"
          style={{ background: 'linear-gradient(to bottom, rgba(0,212,255,0.5), transparent)' }} />

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: '#3B82F6' }} />
              <span className="text-xs font-semibold" style={{ color: '#3B82F6' }}>Everything You Need</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Built for <span className="gradient-text">Every Emergency</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A complete suite of tools designed to handle every aspect of disaster management,
              from prediction to recovery.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.label}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="glass-card p-6 cursor-pointer group"
                  style={{
                    border: `1px solid ${feature.border}`,
                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                    gridColumn: i >= 9 ? 'span 2 / span 2' : undefined,
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: feature.bg, border: `1px solid ${feature.border}` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: feature.color }} />
                  </motion.div>
                  <h3 className="text-sm font-bold text-white mb-2 group-hover:text-white transition-colors">
                    {feature.label}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>

                  {/* Bottom glow on hover */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl"
                    style={{ background: `linear-gradient(to right, transparent, ${feature.color}, transparent)` }}
                  />
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.05) 0%, rgba(59,130,246,0.05) 50%, rgba(139,92,246,0.05) 100%)',
          }} />
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.4), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.4), transparent)' }} />

        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              Impact That <span className="gradient-text">Matters</span>
            </h2>
            <p className="text-gray-400">Real numbers from real emergency operations</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { target: 12847, suffix: '+', label: 'Lives Saved', sub: 'Across all operations', color: '#EF4444' },
              { target: 543, suffix: '+', label: 'Incidents Managed', sub: 'Since platform launch', color: '#F97316' },
              { target: 98.3, suffix: '%', label: 'AI Accuracy', sub: 'Prediction success rate', color: '#00D4FF' },
              { target: 52, suffix: ' Cities', label: 'Coverage', sub: 'Across 12 states', color: '#22C55E' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div
                  className="text-4xl sm:text-5xl font-black mb-2"
                  style={{ color: stat.color }}
                >
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                </div>
                <div className="text-lg font-bold text-white mb-1">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <CheckCircle className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
              <span className="text-xs font-semibold" style={{ color: '#22C55E' }}>Simple Process</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              How <span className="gradient-text">ResQAI Works</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              From incident detection to full response deployment in minutes, not hours.
            </p>
          </motion.div>

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Connecting line */}
            <div
              className="hidden lg:block absolute top-1/2 left-0 right-0 h-px -translate-y-1/2"
              style={{
                background: 'linear-gradient(to right, #EF4444, #00D4FF, #22C55E)',
                opacity: 0.3,
              }}
            />

            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  className="relative flex-1 max-w-xs"
                >
                  <div className="glass-card p-8 text-center relative overflow-hidden"
                    style={{ border: `1px solid ${step.color}30` }}>
                    {/* Step number */}
                    <div
                      className="absolute top-4 right-4 text-xs font-black opacity-20"
                      style={{ color: step.color, fontSize: '3rem', lineHeight: 1 }}
                    >
                      {step.number}
                    </div>

                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                      style={{
                        background: `${step.color}15`,
                        border: `1px solid ${step.color}30`,
                        boxShadow: `0 0 30px ${step.color}20`,
                      }}
                    >
                      <Icon className="w-8 h-8" style={{ color: step.color }} />
                    </motion.div>

                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                  </div>

                  {/* Arrow connector for desktop */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 z-10">
                      <ArrowRight className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}>
              <Star className="w-3.5 h-3.5" style={{ color: '#EAB308' }} />
              <span className="text-xs font-semibold" style={{ color: '#EAB308' }}>Trusted by Experts</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              What <span className="gradient-text">Responders Say</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ y: -6 }}
                className="glass-card p-8 relative overflow-hidden"
                style={{ border: `1px solid ${t.color}20` }}
              >
                {/* Quote mark */}
                <div
                  className="absolute top-4 right-6 text-7xl font-black opacity-10 leading-none"
                  style={{ color: t.color }}
                >
                  "
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <Star key={si} className="w-4 h-4 fill-current" style={{ color: '#EAB308' }} />
                  ))}
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-6 relative z-10">
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-base font-bold text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-8">
            Trusted & certified by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {['NDMA India', 'UNDP', 'ISO 27001', 'Red Cross', 'FEMA Compliant', 'Govt. Certified'].map((badge) => (
              <div key={badge} className="flex items-center gap-2">
                <Award className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-400">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl p-12 text-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(59,130,246,0.1) 50%, rgba(139,92,246,0.1) 100%)',
              border: '1px solid rgba(0,212,255,0.2)',
            }}
          >
            {/* Animated background circles */}
            <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full opacity-10 float-animation"
              style={{ background: 'radial-gradient(circle, #00D4FF, transparent)' }} />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full opacity-10 float-slow"
              style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }} />

            <div className="relative z-10">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}
              >
                <Shield className="w-8 h-8 text-white" />
              </motion.div>

              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                Ready to <span className="gradient-text">Save Lives?</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Join 500+ emergency management organizations already using ResQAI to protect communities.
                Start your free account today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #00D4FF, #3B82F6)',
                      boxShadow: '0 8px 30px rgba(0,212,255,0.35)',
                    }}
                  >
                    Get Started Free <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Already have an account? Sign in →
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/8 py-16 px-6"
        style={{ background: 'rgba(5,9,17,0.8)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}>
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold gradient-text">ResQAI</span>
              </div>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed max-w-xs">
                AI-powered disaster response platform protecting communities through intelligent
                prediction and coordinated emergency management.
              </p>
              <div className="flex gap-3">
                {[Activity, Shield, Zap].map((Icon, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <Icon className="w-4 h-4 text-gray-400" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { title: 'Platform', links: ['Features', 'How It Works', 'Pricing', 'API Docs', 'Status'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Partners', 'Press'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Compliance'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              © 2024 ResQAI. All rights reserved. Built with ❤️ for emergency responders.
            </p>
            <div className="flex items-center gap-2">
              <div className="status-dot active" />
              <span className="text-xs text-gray-600">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
