import React from 'react'
import { useRouter } from 'next/router'

const RestfulAPI: React.FC = () => {
  const router = useRouter()

  return (
    <div className='w-[400px] md:w-[450px] m-auto mt-8 mb-8 border p-4 rounded-lg text-gray-600'>
      <p>
        All my online assets live somewhere, so i have built this CRUD application. It is a RESTful
        API that allows me to create, read, update and delete data.
      </p>
      <button
        onClick={() => router.push('/restapi')}
        className='text-[12px] p-2 px-4 rounded-[11px] bg-red-500 text-white hover:scale-125 transition duration-700 ease-in-out mt-5'
      >
        View App
      </button>
    </div>
  )
}

export default RestfulAPI
