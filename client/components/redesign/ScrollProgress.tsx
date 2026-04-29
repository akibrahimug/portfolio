'use client'

import * as React from 'react'
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion'

export function ScrollProgress() {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 30, mass: 0.4 })
  if (reduced) return null
  return (
    <motion.div
      style={{ scaleX, transformOrigin: '0%' }}
      className='fixed inset-x-0 top-0 z-50 h-[2px] bg-brand-500'
      aria-hidden
    />
  )
}
