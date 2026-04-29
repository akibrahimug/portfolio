import React from 'react'
// import Line from '@/public/icons/line.svg'
import Image from 'next/image'
import 'react-loading-skeleton/dist/skeleton.css'
import Bio from '@/components/Bio'
import { MouseSimple } from '@phosphor-icons/react'
import { motion, useReducedMotion } from 'framer-motion'

const Avarta: React.FC = () => {
  const reduced = useReducedMotion()
  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <div className='grid grid-rows-2'>
      <div className='flex justify-center lg:justify-end'>
        <div className='relative w-full max-w-[450px] aspect-[360/350] md:aspect-[400/480] md:max-w-[25em] lg:max-w-[25em] m-auto lg:mt-10'>
          <Image
            src='/icons/avarta.webp'
            fill
            style={{ objectFit: 'contain' }}
            alt='Ibrahim portfolio avatar'
            priority
            sizes='(max-width: 768px) 360px, (max-width: 1024px) 400px, 500px'
            placeholder='blur'
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0eH/xAAVAQEBAQEAAAAAAAAAAAAAAAAAAQIF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bvZ6kvJuyxwXO0/T9GD7j7HQ7x39BHPPPOqMFJlQNrGNNSNjd5f5qvPPPPKqMFAcI+w+x0OsA=='"
          />
        </div>
        <div className='absolute top-[250px] right-16 hidden xl:block'>
          <button
            type='button'
            onClick={scrollToProjects}
            aria-label='Scroll to projects'
            className='group text-gray-400 hover:text-brand-500 transition-colors'
          >
            <div className='flex flex-col items-center'>
              <motion.div
                className='mb-2'
                animate={reduced ? undefined : { y: [0, -8, -4, -12, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <MouseSimple className='w-5 h-5' />
              </motion.div>

              <div className='relative h-20 w-px bg-gradient-to-b from-transparent via-current to-transparent overflow-hidden'>
                <motion.span
                  className='absolute left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-current'
                  animate={reduced ? undefined : { y: [0, 16, 0], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              <motion.span
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                }}
                animate={reduced ? undefined : { opacity: [0.6, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' }}
                className='mt-2 text-sm tracking-wider'
              >
                Scroll
              </motion.span>
              <motion.span
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                }}
                animate={reduced ? undefined : { opacity: [0.6, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse', delay: 0.3 }}
                className='text-sm tracking-wider'
              >
                Down
              </motion.span>
            </div>
          </button>
        </div>
      </div>
      <div className='mt-6 z-10'>
        <Bio />
      </div>
    </div>
  )
}

export default Avarta
