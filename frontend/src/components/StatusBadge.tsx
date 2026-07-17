import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, Info, Truck } from 'lucide-react'

type Status = 'active' | 'resolved' | 'monitoring' | 'pending' | 'deployed'

interface StatusBadgeProps {
  status: Status
  className?: string
}

const config: Record<
  Status,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode; pulse: boolean }
> = {
  active: {
    label: 'Active',
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/40',
    icon: <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />,
    pulse: true,
  },
  resolved: {
    label: 'Resolved',
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/40',
    icon: <CheckCircle size={12} />,
    pulse: false,
  },
  monitoring: {
    label: 'Monitoring',
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
    icon: <Info size={12} />,
    pulse: false,
  },
  pending: {
    label: 'Pending',
    bg: 'bg-yellow-500/20',
    text: 'text-yellow-400',
    border: 'border-yellow-500/40',
    icon: <Clock size={12} />,
    pulse: false,
  },
  deployed: {
    label: 'Deployed',
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500/40',
    icon: <Truck size={12} />,
    pulse: false,
  },
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const c = config[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border} ${className}`}
    >
      {c.pulse ? (
        <motion.span
          className="w-2 h-2 rounded-full bg-red-500 inline-block"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      ) : (
        c.icon
      )}
      {c.label}
    </span>
  )
}

export default StatusBadge
