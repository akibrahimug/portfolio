import React from 'react'
import Logo from './projectpics/Logo.svg'
import { GithubLogo } from '@phosphor-icons/react'
import Link from 'next/link'

interface ModalMenuProps {
  title: string
  handleClick: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const ModalMenu: React.FC<ModalMenuProps> = ({ title, handleClick }) => {
  return (
    <div className='hidden md:block items-center'>
      <div className='grid grid-cols-3 items-center mt-4'>
        <Logo className='w-16 md:ml-10 ' />
        <h3 className='text-lg border-b border-black w-fit m-auto'>{title}</h3>
      </div>

      <div className='relative flex border rounded-full mt-6 items-center justify-between bg-gray-100 max-w-[800px] m-auto'>
        <div className='border-r'>
          <button
            onClick={handleClick}
            value='Contact Me'
            className='hover:bg-gray-200 p-6 m-0 rounded-full w-[200px]'
          >
            Contact Me
          </button>
        </div>
        <div className='border-r'>
          <button
            onClick={handleClick}
            value='TechStack'
            className=' hover:bg-gray-200 p-6 m-0 rounded-full  w-[200px]'
          >
            TechStack
          </button>
        </div>
        <div className='border-r'>
          <button
            onClick={handleClick}
            value='Resume'
            className=' hover:bg-gray-200 p-6 m-0 rounded-full  w-[200px]'
          >
            Resume
          </button>
        </div>
        <button
          onClick={handleClick}
          value='Restful API'
          className=' hover:bg-gray-200 p-6 text-left rounded-full w-[200px]'
        >
          Restful API
        </button>
        <Link
          href='https://github.com/akibrahimug'
          className='bg-white p-[22px] top-0 right-0 m-0 hover:scale-105 hover:border hover:bg-red-500 transition transform ease-out duration-105  hover:text-white shadow-md rounded-full absolute '
        >
          <GithubLogo size={24} aria-label='GitHub' />
        </Link>
      </div>
    </div>
  )
}

export default ModalMenu
