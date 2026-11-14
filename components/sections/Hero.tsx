import type { CSSProperties } from 'react'
import Image from 'next/image'
import { redesignContent } from '@/lib/redesign-content'
import { Container } from '@/components/ui/Container'
import { Heading, Text } from '@/components/ui/Typography'
import { ButtonLink, Arrow } from '@/components/ui/Button'
import { RiseText } from '@/components/motion/RiseText'
import { FigureText } from '@/components/ui/FigureText'

const delay = (ms: number) => ({ '--enter-delay': `${ms}ms` }) as CSSProperties

export function Hero() {
  const { hero } = redesignContent

  return (
    <section id='top' aria-labelledby='hero-h' className='flex min-h-svh flex-col justify-center pb-10 pt-20 md:pb-20 md:pt-32'>
      <Container className='grid items-start gap-8 md:grid-cols-12 md:gap-6'>
        <div className='hero-text md:col-span-7'>
          <Heading level={1} size='xl' id='hero-h' className='font-extrabold'>
            <RiseText text={hero.headline} />
          </Heading>
          <Text size='lead' className='enter-up mt-6 max-w-xl md:text-xl md:leading-relaxed' style={delay(420)}>
            <FigureText text={hero.statement} />
          </Text>

          <div className='enter-up mt-8 flex flex-wrap items-center gap-3' style={delay(520)}>
            <ButtonLink href={hero.primaryCta.href}>
              {hero.primaryCta.label}
              <Arrow />
            </ButtonLink>
            <ButtonLink href={hero.secondaryCta.href} variant='outline'>
              {hero.secondaryCta.label}
              <Arrow dir='down' />
            </ButtonLink>
          </div>

        </div>

        <div className='order-first md:order-last md:col-span-5'>
          {/* A still photograph: the LCP element, no effect over it. */}
          <Image
            src={hero.avatarSrc}
            width={hero.avatarWidth}
            height={hero.avatarHeight}
            alt={hero.avatarAlt}
            priority
            sizes='(max-width: 640px) 11rem, (max-width: 768px) 15rem, 30rem'
            className='mx-auto h-auto w-44 sm:w-60 md:w-full md:max-w-[30rem]'
          />
        </div>
      </Container>
    </section>
  )
}
