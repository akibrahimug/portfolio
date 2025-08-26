import React from 'react'
import Head from 'next/head'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import TechStackScroll from '@/components/TechStack-scroll'
import Projects from '@/components/Projects'

const Home: React.FC = () => {
  return (
    <>
      <Head>
        <title>Kasoma Ibrahim</title>
        <meta name='description' content='This is a portfolio showcasing what Kasoma Ibrahim can build and deliver as a Software Engineer' />
        <link rel='icon' href='/favicon.png' />
      </Head>
      <Header />
      <div className='max-w-[1400px] m-auto'>
        <HeroSection certified={[]} />
      </div>
      <div className='max-w-[1400px] m-auto' id='tech-stack'>
        <TechStackScroll />
      </div>
      <div>
        <Projects />
      </div>
    </>
  )
}

export default Home
