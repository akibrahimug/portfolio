import { redesignContent } from '@/lib/redesign-content'
import { Section } from '@/components/patterns/Section'
import { Text, Eyebrow } from '@/components/ui/Typography'

export function About() {
  const { about, currently } = redesignContent

  return (
    <Section id='about'>
      <Section.Header>
        <Section.Title>{about.heading}</Section.Title>
      </Section.Header>
      <Section.Body>
        <div className='grid gap-12 md:grid-cols-12 md:gap-6'>
          <div className='space-y-5 md:col-span-7'>
            {about.paragraphs.map((p, i) => (
              <Text key={i} size='lead'>
                {p}
              </Text>
            ))}
          </div>

          <div className='self-start rounded-3xl bg-card p-6 md:col-span-4 md:col-start-9 md:p-8'>
            <Eyebrow>Now · {currently.asOf}</Eyebrow>
            <dl className='mt-5 space-y-5'>
              {currently.items.map((item) => (
                <div key={item.k} className='border-t border-border pt-4'>
                  <dt className='text-base font-semibold'>{item.k}</dt>
                  <dd className='mt-1 text-sm leading-relaxed text-muted-foreground'>{item.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section.Body>
    </Section>
  )
}
