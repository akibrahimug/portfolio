'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FramerModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export const FramerModal: React.FC<FramerModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className='bg-white p-6 rounded-lg max-w-md w-full mx-4'
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
