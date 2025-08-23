import React from 'react'
import NavButtons from '@/components/NavButtons'
const MainHeader: React.FC = () => {
  return (
    <div className='border flex rounded-full items-center text-sm shadow-sm hover:shadow-md m-auto'>
      <NavButtons />
    </div>
  )
}

export default MainHeader
