import { Section } from '@/components/patterns/Section'
import { CountUp } from '@/components/motion/CountUp'
import { GrowBar } from '@/components/motion/GrowBar'
import { Eyebrow, Text } from '@/components/ui/Typography'

type Compare = {
  label: string
  delta: string
  caption: string
  before: { pct: number; value: string }
  after: { pct: number; value: string }
}

// Real before/after figures from the EF platform work, each with the story behind it.
const COMPARES: Compare[] = [
  {
    label: 'CI pipeline time',
    delta: '−67%',
    caption: 'Rebuilt the shared CI/CD pipeline that ships 17 production front-end apps.',
    before: { pct: 100, value: '45 min' },
    after: { pct: 33, value: '15 min' },
  },
  {
    label: 'Test coverage',
    delta: '+55 pts',
    caption: 'Brought Jest + React Testing Library in and made tests part of every PR.',
    before: { pct: 30, value: '30%' },
    after: { pct: 85, value: '85%' },
  },
  {
    label: 'EPI page load',
    delta: '−60%',
    caption: 'Re-architected the EF EPI front end and its data layer; all three Core Web Vitals improved.',
    before: { pct: 100, value: 'baseline' },
    after: { pct: 40, value: '−60%' },
  },
  {
    label: 'Production incidents',
    delta: '−40%',
    caption: 'A downstream result of the coverage work and faster, safer rollbacks.',
    before: { pct: 100, value: 'baseline' },
    after: { pct: 60, value: '−40%' },
  },
]

const SCALE = [
  { value: 3.4, decimals: 1, suffix: 'M', label: 'Monthly active users' },
  { value: 57, suffix: '', label: 'International markets' },
  { value: 17, suffix: '', label: 'Production apps, deployed daily' },
]

export function Impact() {
  return (
    <Section id='impact'>
      <Section.Header index='02' eyebrow='Measured impact'>
        <Section.Title>I own a shared delivery platform at EF.</Section.Title>
        <Section.Intro>
          It sits behind 17 production front-end apps across 60+ markets. Rebuilding it (the
          pipeline, the test culture, the EPI front end) moved real numbers. Here is the before and
          after.
        </Section.Intro>
      </Section.Header>
      <Section.Body>
        <div className='grid gap-x-14 gap-y-12 sm:grid-cols-2'>
          {COMPARES.map((c) => (
            <div key={c.label}>
              <div className='flex items-baseline justify-between gap-4'>
                <span className='font-display text-lg'>{c.label}</span>
                <span className='font-display text-2xl text-accent'>{c.delta}</span>
              </div>
              <Text size='sm' className='mt-2 max-w-md'>
                {c.caption}
              </Text>
              <div className='mt-4 space-y-2'>
                <GrowBar pct={c.before.pct} value={c.before.value} />
                <GrowBar pct={c.after.pct} value={c.after.value} accent delay={0.12} />
              </div>
            </div>
          ))}
        </div>

        <div className='mt-16 border-t border-border pt-10'>
          <Eyebrow>At the scale of</Eyebrow>
          <div className='mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-3'>
            {SCALE.map((s) => (
              <div key={s.label}>
                <div className='font-display text-4xl tracking-tight md:text-5xl'>
                  <CountUp value={s.value} decimals={s.decimals ?? 0} suffix={s.suffix} />
                </div>
                <Eyebrow className='mt-2 tracking-wider'>{s.label}</Eyebrow>
              </div>
            ))}
          </div>
        </div>
      </Section.Body>
    </Section>
  )
}
