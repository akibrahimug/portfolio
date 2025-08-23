import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const Resume: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    // Simulate loading time for the iframe/document, e.g., 3 seconds
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {isLoading ? (
        // Skeleton loader while waiting for content
        <div className='flex justify-center items-center '>
          <Skeleton height={800} width={700} />
        </div>
      ) : (
        <div className='hidden h-[83vh] overflow-scroll scrollbar-hide 2xl:flex flex-col relative'>
          <Link
            href='https://storage.googleapis.com/my-rest-api-2022-kasoma/KASOMA%20IBRAHIM%20_CV%202022%20(1).pdf'
            className='mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded m-auto absolute bottom-10 right-[50%]'
          >
            View and Download Resume as PDF
          </Link>
          <iframe
            src='https://docs.google.com/document/d/e/2PACX-1vTT4w-5NYp7iHC-YqY7tPrzgJ8P2n1HEUyzPDppXIdLzqJpts6-NzRm3e38wIX4UKu0swcme42bIKae/pub?embedded=true'
            className='w-[800px] h-[100vh] m-auto'
          ></iframe>
        </div>
      )}

      <div className='2xl:hidden h-[9vh] flex flex-col '>
        <Link
          target='_blank'
          rel='noreferrer'
          href='https://storage.googleapis.com/my-rest-api-2022-kasoma/KASOMA%20IBRAHIM%20_CV%202022%20(1).pdf'
          className='mt-10 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded m-auto'
        >
          View and Download Resume as PDF
        </Link>
      </div>
    </>
  )
}

export default Resume
