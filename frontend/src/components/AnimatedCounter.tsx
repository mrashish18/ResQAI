import React, { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1.8,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const displayRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: 'easeOut',
    })
    return controls.stop
  }, [value, duration, count])

  return (
    <span className={className}>
      {prefix}
      <motion.span ref={displayRef}>{rounded}</motion.span>
      {suffix}
    </span>
  )
}

export default AnimatedCounter
