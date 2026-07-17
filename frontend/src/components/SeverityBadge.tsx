import React from 'react'
import { motion } from 'framer-motion'

type Severity = 'critical' | 'high' | 'medium' | 'low'

interface SeverityBadgeProps {
  severity: Severity
  className?: string
}

const config: Record<Severity, { label: string; bg: string; text: string; border: string; pulse: boolean }> = {
  critical: {
    label: 'Critical',
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/40',
    pulse: true,
  },
  high: {
    label: 'High',
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500/40',
    pulse: false,
  },
  medium: {
    label: 'Medium',
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/40',
    pulse: false,
  },
  low: {
    label: 'Low',
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/40',
    pulse: false,
  },
}

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '' }) => {
  const c = config[severity]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border} ${className}`}
    >
      {c.pulse && (
        <motion.span
          className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      {c.label}
    </span>
  )
}

export default SeverityBadge
