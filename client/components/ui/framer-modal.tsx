'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FramerModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

// Cast motion.div to a permissive component type so we can pass children + DOM event handlers.
// Framer-motion v10 + React 19 type defs declare children as `unknown`, breaking JSX typing.
const MotionDiv = motion.div as unknown as React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    initial?: Record<string, number>
    animate?: Record<string, number>
    exit?: Record<string, number>
    children?: React.ReactNode
  }
>

export const FramerModal: React.FC<FramerModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
        >
          <MotionDiv
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            className='bg-white p-6 rounded-lg max-w-md w-full mx-4'
          >
            {children}
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  )
}
