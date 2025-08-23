import React from 'react'
import BigProject from '@/components/BigProject'
import SmallProjects from '@/components/SmallProjects'

const Projects: React.FC = () => {
  return (
    <div id='projects'>
      <div className='max-w-[1400px] m-auto mb-32'>
        <BigProject />
      </div>
      <SmallProjects />
    </div>
  )
}

export default Projects
