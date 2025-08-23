import React from 'react'
import Avarta from '@/components/Avarta'
import ProfileDesc from '@/components/ProfileDesc'

type CertifiedSkill = string

interface HeroSectionProps {
  certified: CertifiedSkill[]
}

const certified: CertifiedSkill[] = [
  'Testing and Debugging',
  'Algorithms and Data Structures',
  'Version control systems',
  'Web Accessibility',
  'Front End Libraries',
  'Data Visualization',
  'APIs',
  'Agile Methodologies',
  'Responsive Web Design',
  'Progressive Web Apps',
  'GCP Infrastructure and Services',
  'Search Engine Optimization',
]

const HeroSection: React.FC<HeroSectionProps> = () => {
  return (
    <div className='grid lg:grid-cols-2 relative'>
      <ProfileDesc certified={certified} />
      <Avarta />
    </div>
  )
}

export default HeroSection
