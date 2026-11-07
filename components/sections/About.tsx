import { redesignContent } from '@/lib/redesign-content'
import { Section } from '@/components/patterns/Section'
import { Text, Eyebrow } from '@/components/ui/Typography'

export function About() {
  const { about, currently } = redesignContent

  return (
    <Section id='about'>
      <Section.Header index='04' eyebrow='About'>
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

          <div className='md:col-span-4 md:col-start-9'>
            <Eyebrow>Now · {currently.asOf}</Eyebrow>
            <dl className='mt-5 space-y-5'>
              {currently.items.map((item) => (
                <div key={item.k} className='border-t border-border pt-4'>
                  <dt className='font-display text-sm'>{item.k}</dt>
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
