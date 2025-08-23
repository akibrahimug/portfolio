import React, { useEffect, useState } from 'react'
import Airbnb from './projectpics/Airbnb.png'
import Image from 'next/image'
import { useProjects } from '@/hooks/useHttpApi'
import type { Project } from '@/types/api'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import Link from 'next/link'

const BigProject: React.FC = () => {
  const [project, setProject] = useState<Project | undefined>()
  const { data: projectsData, error } = useProjects()
  const projects = projectsData?.items || []

  useEffect(() => {
    if (projects && Array.isArray(projects)) {
      const airbnbProject = projects.find(
        (proj: Project) => proj.title === 'Airbnb-clone' || proj.projectTitle === 'Airbnb-clone',
      )

      if (airbnbProject) {
        setProject(airbnbProject)
      }
    }
  }, [projects])

  return (
    <div className='flex lg:mt-20 xl:m-0 '>
      <div
        className='text-gray-400 flex-none hidden md:block self-center'
        style={{
          writingMode: 'vertical-lr',
          textOrientation: 'mixed',
        }}
      >
        <h2 className='text-4xl font-bold'>PROJECTS</h2>
      </div>
      {project ? (
        <div className='grow relative lg:px-20 cursor-pointer rounded-md lg:border-0 m-4 '>
          <div className='relative lg:static h-96 min-w-[250px]'>
            <Link
              href={project.liveSiteUrl || project.githubUrl || '#'}
              target='_blank'
              rel='noreferrer'
            >
              <Image
                src={Airbnb}
                alt='Airbnb'
                layout='fill'
                objectFit='cover'
                className='rounded-xl'
              />
            </Link>
          </div>
        </div>
      ) : (
        <div className='grow relative lg:px-20 cursor-pointer rounded-md lg:border-0 m-4 '>
          <Skeleton height={300} />
        </div>
      )}
    </div>
  )
}

export default BigProject
