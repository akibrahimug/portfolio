import React from 'react'
// import Line from '@/public/icons/line.svg'
import Image from 'next/image'
import 'react-loading-skeleton/dist/skeleton.css'
import Bio from '@/components/Bio'
import { MouseSimple } from '@phosphor-icons/react'

const Avarta: React.FC = () => {
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
              <div
                className='mb-2'
                style={{
                  animation: 'mouseFloat 3s ease-in-out infinite',
                }}
              >
                <MouseSimple className='w-5 h-5' />
              </div>

              <div className='relative h-20 w-px bg-gradient-to-b from-transparent via-current to-transparent overflow-hidden'>
                <span
                  className='absolute left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-current'
                  style={{
                    animation: 'scrollBounce 2s ease-in-out infinite',
                    animationFillMode: 'both'
                  }}
                />
              </div>

              <span
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  animation: 'textGlow 2.5s ease-in-out infinite alternate'
                }}
                className='mt-2 text-sm tracking-wider'
              >
                Scroll
              </span>
              <span
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  animation: 'textGlow 2.5s ease-in-out infinite alternate',
                  animationDelay: '0.3s'
                }}
                className='text-sm tracking-wider'
              >
                Down
              </span>

              <style jsx>{`
                @keyframes scrollBounce {
                  0%, 100% {
                    transform: translateX(-50%) translateY(0px);
                    opacity: 1;
                  }
                  25% {
                    transform: translateX(-50%) translateY(10px);
                    opacity: 0.8;
                  }
                  50% {
                    transform: translateX(-50%) translateY(20px);
                    opacity: 0.6;
                  }
                  75% {
                    transform: translateX(-50%) translateY(40px);
                    opacity: 0.3;
                  }
                  90% {
                    transform: translateX(-50%) translateY(60px);
                    opacity: 0.1;
                  }
                  95% {
                    transform: translateX(-50%) translateY(70px);
                    opacity: 0;
                  }
                }

                @keyframes mouseFloat {
                  0%, 100% {
                    transform: translateY(0px) scale(1);
                    opacity: 0.7;
                  }
                  25% {
                    transform: translateY(-8px) scale(1.1);
                    opacity: 1;
                  }
                  50% {
                    transform: translateY(-4px) scale(1.05);
                    opacity: 0.9;
                  }
                  75% {
                    transform: translateY(-12px) scale(1.15);
                    opacity: 1;
                  }
                }

                @keyframes textGlow {
                  0% {
                    opacity: 0.4;
                    transform: scale(0.95);
                    text-shadow: 0 0 5px rgba(156, 163, 175, 0.3);
                  }
                  100% {
                    opacity: 1;
                    transform: scale(1.05);
                    text-shadow: 0 0 15px rgba(156, 163, 175, 0.6);
                  }
                }
              `}</style>
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
