import { redesignContent } from '@/lib/redesign-content'
import { Section } from '@/components/patterns/Section'
import { CountUp } from '@/components/motion/CountUp'
import { GrowBar } from '@/components/motion/GrowBar'
import { Eyebrow, Text } from '@/components/ui/Typography'

export function Impact() {
  const { compares: COMPARES, scale: SCALE } = redesignContent.impact
  return (
    <Section id='impact'>
      <Section.Header index='03' eyebrow='Measured impact'>
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
                  <CountUp value={s.value} decimals={'decimals' in s ? s.decimals : 0} suffix={s.suffix} />
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
