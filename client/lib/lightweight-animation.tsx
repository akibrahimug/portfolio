'use client'

import React from 'react'

// Lightweight animation alternatives for simple animations
interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export const FadeIn: React.FC<FadeInProps> = ({ children, className = '', delay = 0 }) => {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'} ${className}`}
    >
      {children}
    </div>
  )
}

interface SlideUpProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export const SlideUp: React.FC<SlideUpProps> = ({ children, className = '', delay = 0 }) => {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  )
}

// For critical animations that need Framer Motion, lazy load it
export const LazyMotion = React.lazy(() => import('framer-motion').then(module => ({
  default: module.motion.div
})))

// Intersection observer hook for scroll-based animations
export const useInViewport = (options = {}) => {
  const [isInView, setIsInView] = React.useState(false)
  const ref = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        ...options,
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [options])

  return { ref, isInView }
}