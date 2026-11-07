import { redesignContent } from '@/lib/redesign-content'
import { Section } from '@/components/patterns/Section'
import { Reveal } from '@/components/motion/Reveal'
import { Heading, Eyebrow } from '@/components/ui/Typography'
import { TextLink } from '@/components/ui/TextLink'
import { BulletList } from '@/components/ui/Lists'

export function Experience() {
  const { experience } = redesignContent

  return (
    <Section id='experience'>
      <Section.Header index='04' eyebrow='Experience'>
        <Section.Title>{experience.heading}</Section.Title>
      </Section.Header>
      <Section.Body>
        <div className='space-y-px'>
          {experience.roles.map((role, i) => {
            const href = 'href' in role ? (role.href as string) : undefined
            return (
              <Reveal key={`${role.company}-${role.title}-${role.period}`} delay={i * 0.04}>
                <div className='grid gap-4 border-t border-border py-9 md:grid-cols-[12rem_1fr] md:gap-10'>
                  <div className='text-sm'>
                    <p className='text-faint'>{role.period}</p>
                    <p className='mt-1 text-muted-foreground'>{role.place}</p>
                  </div>
                  <div>
                    <Heading level={3} size='sm'>
                      {role.title && (
                        <>
                          {role.title}
                          <span className='text-muted-foreground'> · </span>
                        </>
                      )}
                      {href ? (
                        <TextLink variant='inline' external href={href} className='underline-offset-4'>
                          {role.company}
                        </TextLink>
                      ) : (
                        role.company
                      )}
                    </Heading>
                    <BulletList items={role.bullets} className='mt-4' />
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        <div className='mt-10 grid gap-4 border-t border-border pt-8 sm:grid-cols-2'>
          {experience.education.map((e) => (
            <div key={e.school}>
              <Eyebrow className='tracking-wider'>{e.period}</Eyebrow>
              <p className='mt-1 font-display text-base'>{e.school}</p>
              <p className='text-sm text-muted-foreground'>{e.course}</p>
            </div>
          ))}
        </div>
      </Section.Body>
    </Section>
  )
}
