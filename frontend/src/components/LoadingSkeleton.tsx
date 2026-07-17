import React from 'react'
import { motion } from 'framer-motion'

const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.8,
      ease: 'linear' as const,
      repeat: Infinity,
    },
  },
}

const shimmerStyle = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '200% 100%',
}

export const SkeletonText: React.FC<{ className?: string }> = ({ className = '' }) => (
  <motion.div
    className={`rounded-md ${className}`}
    style={shimmerStyle}
    variants={shimmer}
    animate="animate"
  />
)

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <motion.div
    className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-4 ${className}`}
  >
    <div className="flex items-center gap-3">
      <motion.div
        className="w-10 h-10 rounded-full"
        style={shimmerStyle}
        variants={shimmer}
        animate="animate"
      />
      <div className="flex-1 space-y-2">
        <SkeletonText className="h-4 w-3/4" />
        <SkeletonText className="h-3 w-1/2" />
      </div>
    </div>
    <SkeletonText className="h-3 w-full" />
    <SkeletonText className="h-3 w-5/6" />
    <SkeletonText className="h-3 w-2/3" />
  </motion.div>
)

export const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 4,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`}>
    {/* Header */}
    <div className="flex gap-3 px-4 py-2">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonText key={i} className="h-3 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <motion.div
        key={rowIdx}
        className="flex gap-3 items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rowIdx * 0.05 }}
      >
        {Array.from({ length: cols }).map((_, colIdx) => (
          <SkeletonText key={colIdx} className={`h-3 flex-1 ${colIdx === 0 ? 'w-8 h-8 rounded-full flex-none' : ''}`} />
        ))}
      </motion.div>
    ))}
  </div>
)

const LoadingSkeleton = { SkeletonCard, SkeletonText, SkeletonTable }
export default LoadingSkeleton
