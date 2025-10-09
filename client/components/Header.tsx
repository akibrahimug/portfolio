import React from 'react'
import MainHeader from '@/components/MainHeader'
import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react'
import Methodologies from '@/components/Methodologies'

const Header: React.FC = () => {
  return (
    <div className='border-b items-center shadow-sd grid grid-cols-[1fr_auto_1fr] md:grid-cols-[20%_1fr_30%] lg:grid-cols-3 pt-3 pb-4'>
      {/* logo */}
      <Link href='/'>
        <ArrowLeft
          className='lg:hidden text-gray-900 md:ml-4 hover:bg-brand-50 hover:text-brand-600 rounded-full p-2 hover:scale-105 transition duration-150 ease-out'
          size={45}
        />
      </Link>
      <MainHeader />
      <div className='hidden md:block m-auto'>
        <Methodologies />
      </div>
    </div>
  )
}

export default Header
