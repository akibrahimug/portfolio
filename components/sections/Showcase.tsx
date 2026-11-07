import { redesignContent } from '@/lib/redesign-content'
import { Section } from '@/components/patterns/Section'
import { ProjectCard } from './ProjectCard'

export function Showcase() {
  const { showcase } = redesignContent

  return (
    <Section id='showcase'>
      <Section.Header index='04' eyebrow='Projects'>
        <Section.Title>{showcase.heading}</Section.Title>
        <Section.Intro>{showcase.body}</Section.Intro>
      </Section.Header>
      <Section.Body>
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {showcase.items.map((item, i) => (
            <ProjectCard key={item.slug} item={item} index={i} />
          ))}
        </div>
      </Section.Body>
    </Section>
  )
}
