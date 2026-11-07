import { Section } from '@/components/patterns/Section'
import { DemoConsole } from '@/components/demo/DemoConsole'
import { exampleMessages } from '@/lib/demo/offline'

export function Demo() {
  return (
    <Section id='demo'>
      <Section.Header index='01' eyebrow='Live demo'>
        <Section.Title>
          Ask a <em>free model</em> about my work.
        </Section.Title>
        <Section.Intro>
          The model reads this site through five tools and can only use what they return, so every figure is
          real. Its answer streams in as the same project cards, charts and timeline the rest of the page uses.
          Turn on “Show how” to see each call.
        </Section.Intro>
      </Section.Header>
      <Section.Body>
        <DemoConsole initialMessages={exampleMessages()} />
      </Section.Body>
    </Section>
  )
}
