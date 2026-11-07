import { redesignContent } from '@/lib/redesign-content'
import { Section } from '@/components/patterns/Section'
import { Reveal } from '@/components/motion/Reveal'
import { Heading, Text } from '@/components/ui/Typography'
import { TextLink } from '@/components/ui/TextLink'
import { TagList } from '@/components/ui/Lists'

export function Work() {
  const { work } = redesignContent

  return (
    <Section id='work'>
      <Section.Header index='01' eyebrow='Selected work'>
        <Section.Title>{work.heading}</Section.Title>
      </Section.Header>
      <Section.Body>
        <ul className='-mt-2'>
          {work.items.map((item, i) => {
            const { title, live } = item
            return (
            <Reveal as='li' key={item.slug} delay={i * 0.05}>
              <article className='grid gap-4 border-t border-border py-9 md:grid-cols-[7rem_1fr] md:gap-10'>
                <div className='text-sm text-faint'>{item.year}</div>
                <div>
                  <div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1'>
                    <Heading level={3} size='md'>
                      {live ? (
                        <TextLink
                          variant='inline'
                          external
                          href={live}
                          className='decoration-transparent'
                        >
                          {title}
                        </TextLink>
                      ) : (
                        title
                      )}
                    </Heading>
                    {live && (
                      <TextLink variant='action' external href={live}>
                        Visit ↗
                      </TextLink>
                    )}
                  </div>
                  <Text size='sm' className='mt-1'>
                    {item.role}
                  </Text>
                  <Text className='mt-4 max-w-2xl'>{item.summary}</Text>
                  <p className='mt-5 flex items-center gap-2.5 text-sm font-medium text-accent'>
                    <span className='inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent' aria-hidden />
                    {item.metric}
                  </p>
                  <TagList items={item.stack} className='mt-4' />
                </div>
              </article>
            </Reveal>
            )
          })}
        </ul>
      </Section.Body>
    </Section>
  )
}
