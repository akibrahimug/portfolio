import React from 'react'
// import Line from '@/public/icons/line.svg'
import Image from 'next/image'
import 'react-loading-skeleton/dist/skeleton.css'
import Bio from '@/components/Bio'
import { motion } from 'framer-motion'
import { MouseSimple } from '@phosphor-icons/react'

const Avarta: React.FC = () => {
  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <div className='grid grid-rows-2'>
      <div className='flex justify-center lg:justify-end'>
        <div className='relative w-[360px] mt-8 h-[350px] min-w-[300px] md:h-[30em] md:w-[25em] m-auto lg:mt-10'>
          <Image
            src='/icons/avarta.webp'
            fill
            style={{ objectFit: 'cover' }}
            alt='avarta'
            priority
          />
        </div>
        <span className='font-semibold absolute w-[219px] right-10 top-[90px] text-lg hidden xl:block text-gray-600'>
          {'"Let\'s create an amazing web experince together."'}
        </span>
        <div className='absolute top-[250px] right-16 hidden xl:block'>
          <button
            type='button'
            onClick={scrollToProjects}
            aria-label='Scroll to projects'
            className='group text-gray-400 hover:text-gray-600 transition-colors'
          >
            <div className='flex flex-col items-center'>
              <motion.div
                aria-hidden
                animate={{ y: [0, 6, 0], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className='mb-2'
              >
                <MouseSimple className='w-5 h-5' />
              </motion.div>

              <div className='relative h-16 w-px bg-gradient-to-b from-transparent via-current to-transparent overflow-hidden'>
                <motion.span
                  aria-hidden
                  className='absolute left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-current'
                  animate={{ y: [-8, 64] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              <motion.span
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                className='mt-2 text-sm tracking-wider'
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Scroll
              </motion.span>
              <motion.span
                style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                className='text-sm tracking-wider'
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
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
