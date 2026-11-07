import type { CSSProperties } from 'react'
import { redesignContent } from '@/lib/redesign-content'
import { Container } from '@/components/ui/Container'
import { Heading, Text, Eyebrow } from '@/components/ui/Typography'
import { ButtonLink, Arrow } from '@/components/ui/Button'
import { RiseText } from '@/components/motion/RiseText'
import { InkPortrait } from '@/components/hero/InkPortrait'

const delay = (ms: number) => ({ '--enter-delay': `${ms}ms` }) as CSSProperties

export function Hero() {
  const { hero } = redesignContent

  return (
    <section id='top' aria-labelledby='hero-h' className='flex min-h-svh flex-col justify-center pb-10 pt-20 md:pb-20 md:pt-32'>
      <Container className='grid items-start gap-6 md:grid-cols-12 md:gap-6'>
        <div className='hero-text md:col-span-7'>
          <Eyebrow className='enter-up text-balance' style={delay(0)}>
            {hero.availability}
          </Eyebrow>
          <Heading level={1} size='xl' id='hero-h' className='mt-6'>
            <RiseText segments={hero.headline} />
          </Heading>
          <Text size='lead' className='enter-up mt-6 max-w-xl' style={delay(420)}>
            {hero.statement}
          </Text>

          <div className='enter-up mt-8 flex flex-wrap items-center gap-3' style={delay(520)}>
            <ButtonLink href={hero.primaryCta.href}>
              {hero.primaryCta.label}
              <Arrow />
            </ButtonLink>
            <ButtonLink href={hero.secondaryCta.href} variant='outline'>
              {hero.secondaryCta.label}
              <Arrow />
            </ButtonLink>
          </div>

          <dl
            className='enter-up mt-14 hidden max-w-xl grid-cols-3 divide-x divide-border border-t border-border md:grid'
            style={delay(620)}
          >
            {hero.stats.map((s) => (
              <div key={s.label} className='flex flex-col-reverse pt-8 first:pr-5 not-first:px-5'>
                <dt className='mt-2 text-[11px] uppercase leading-snug tracking-wider text-faint'>
                  {s.label}
                </dt>
                <dd className='font-display text-3xl tracking-tight md:text-4xl'>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className='order-first md:order-last md:col-span-5'>
          <InkPortrait
            src={hero.avatarSrc}
            width={hero.avatarWidth}
            height={hero.avatarHeight}
            alt={hero.avatarAlt}
            protect={hero.avatarProtect}
            className='enter-settle relative mx-auto aspect-4/5 w-40 cursor-crosshair sm:w-56 md:w-full md:max-w-md'
          />
        </div>
      </Container>
    </section>
  )
}
