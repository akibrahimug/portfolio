import { redesignContent } from '@/lib/redesign-content'
import { Section } from '@/components/patterns/Section'
import { Heading, Eyebrow } from '@/components/ui/Typography'
import { TextLink } from '@/components/ui/TextLink'
import { BulletList } from '@/components/ui/Lists'

export function Experience() {
  const { experience } = redesignContent

  return (
    <Section id='experience'>
      <Section.Header index='03' eyebrow='Experience'>
        <Section.Title>{experience.heading}</Section.Title>
      </Section.Header>
      <Section.Body>
        <div className='space-y-px'>
          {experience.roles.map((role, i) => {
            const href = 'href' in role ? (role.href as string) : undefined
            return (
              <div key={`${role.company}-${role.title}-${role.period}`}>
                <div className='grid gap-4 border-t border-border py-9 md:grid-cols-12 md:gap-6'>
                  <div className='text-sm md:col-span-3'>
                    <p className='text-faint'>{role.period}</p>
                    <p className='mt-1 text-muted-foreground'>{role.place}</p>
                  </div>
                  <div className='md:col-span-9'>
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
              </div>
            )
          })}
        </div>

        <div className='mt-10 grid gap-4 border-t border-border pt-8 sm:grid-cols-2 md:grid-cols-12 md:gap-6 [&>*]:md:col-span-3 [&>*:first-child]:md:col-start-4'>
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
