import Image from 'next/image'
import { redesignContent } from '@/lib/redesign-content'
import { Container } from '@/components/ui/Container'
import { Heading, Text, Eyebrow } from '@/components/ui/Typography'
import { ButtonLink, Arrow } from '@/components/ui/Button'

const HERO_STATS = [
  { value: '6+', label: 'Years in production' },
  { value: '80+', label: 'Apps shipped' },
  { value: '7+', label: 'Concurrent EF projects' },
]

export function Hero() {
  const { hero } = redesignContent

  return (
    <Container as='section' id='top' className='pb-20 pt-36 md:pb-28 md:pt-44'>
      <div className='grid items-center gap-12 md:grid-cols-[1.4fr_0.9fr] md:gap-10'>
        <div>
          <Eyebrow>{hero.availability}</Eyebrow>
          <Heading level={1} size='xl' className='mt-6'>
            I build and scale the web platforms behind products millions of people use.
          </Heading>
          <Text size='lead' className='mt-6 max-w-xl'>
            {hero.statement}
          </Text>

          <div className='mt-8 flex flex-wrap items-center gap-3'>
            <ButtonLink href={hero.primaryCta.href}>
              {hero.primaryCta.label}
              <Arrow />
            </ButtonLink>
            <ButtonLink href='#work' variant='outline'>
              See selected work
              <Arrow />
            </ButtonLink>
          </div>

          <dl className='mt-14 grid max-w-xl grid-cols-3 divide-x divide-border border-t border-border'>
            {HERO_STATS.map((s) => (
              <div key={s.label} className='pt-8 first:pr-5 not-first:px-5'>
                <dt className='font-display text-3xl font-medium tracking-tight md:text-4xl'>
                  {s.value}
                </dt>
                <dd className='mt-2 text-[11px] uppercase leading-snug tracking-wider text-faint'>
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className='order-first md:order-last md:-mt-90'>
          <div className='relative mx-auto aspect-4/5 w-56 sm:w-64 md:w-full'>
            <Image
              src={hero.avatarSrc}
              alt={hero.avatarAlt}
              fill
              priority
              sizes='(max-width: 768px) 16rem, 28rem'
              className='object-contain'
            />
          </div>
          <Eyebrow className='mt-3 text-center tracking-wider md:text-left'>{hero.location}</Eyebrow>
        </div>
      </div>
    </Container>
  )
}
