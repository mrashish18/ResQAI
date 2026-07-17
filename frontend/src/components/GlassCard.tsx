import React from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  glowColor?: string
  onClick?: () => void
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = false,
  glow = false,
  glowColor = '#00D4FF',
  onClick,
}) => {
  const glowStyle = glow
    ? {
        boxShadow: `0 0 24px 2px ${glowColor}33, 0 4px 32px 0 rgba(0,0,0,0.4)`,
      }
    : {}

  return (
    <motion.div
      onClick={onClick}
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={glowStyle}
      whileHover={
        hover
          ? { scale: 1.025, boxShadow: `0 0 32px 4px ${glowColor}44` }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      {children}
    </motion.div>
  )
}

export default GlassCard
