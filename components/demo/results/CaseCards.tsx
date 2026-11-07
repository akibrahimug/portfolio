import type { findWork } from '@/lib/demo/catalog'
import { Heading, Text, Eyebrow } from '@/components/ui/Typography'
import { TagList } from '@/components/ui/Lists'

export function CaseCards({ output }: { output: ReturnType<typeof findWork> }) {
  if (!output.projects.length) {
    return <Text size='sm'>Nothing on this site matches that yet.</Text>
  }
  return (
    <ul className='grid gap-4 sm:grid-cols-2'>
      {output.projects.map((p) => (
        <li key={p.slug} className='group relative flex flex-col border border-border bg-card/40 p-5 transition-[border-color,transform] duration-200 hover:border-accent/60 motion-safe:hover:-translate-y-0.5'>
          <Eyebrow as='span' className='tracking-wider'>
            {p.origin === 'ef' ? `EF Education First${p.year ? ` · ${p.year}` : ''}` : p.kind}
          </Eyebrow>
          <Heading level={4} size='xs' className='mt-3 text-lg group-hover:text-accent'>
            {p.live ? (
              <a href={p.live} target='_blank' rel='noopener noreferrer' className='before:absolute before:inset-0'>
                {p.title}
              </a>
            ) : (
              p.title
            )}
          </Heading>
          <Text size='sm' className='mt-2 line-clamp-3'>
            {p.summary}
          </Text>
          {p.metric && <p className='mt-3 text-sm font-medium text-accent'>{p.metric}</p>}
          <TagList items={p.stack} className='mt-auto gap-x-3 pt-4' />
        </li>
      ))}
    </ul>
  )
}
