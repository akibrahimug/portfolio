import Link from 'next/link'
import type { findWork } from '@/lib/demo/catalog'
import { Heading, Text, Eyebrow } from '@/components/ui/Typography'
import { TagList } from '@/components/ui/Lists'
import { Arrow } from '@/components/ui/Button'

export function CaseCards({ output }: { output: ReturnType<typeof findWork> }) {
  if (!output.projects.length) {
    return <Text size='sm'>Nothing on this site matches that yet.</Text>
  }
  return (
    <ul className='stagger grid gap-4 sm:grid-cols-2'>
      {output.projects.map((p) => (
        <li key={p.slug} className='group relative flex flex-col rounded-2xl border border-border bg-background p-5 transition-[border-color,transform] duration-200 hover:border-border-strong motion-safe:hover:-translate-y-0.5'>
          <Eyebrow as='span' className='text-xs'>
            {p.origin === 'ef' ? `EF Education First${p.year ? ` · ${p.year}` : ''}` : p.kind}
          </Eyebrow>
          <Heading level={3} size='xs' className='mt-1 text-lg'>
            {p.caseStudy ? (
              <Link href={p.caseStudy} transitionTypes={['to-case']} className='inline-flex min-h-11 items-center before:absolute before:inset-0'>
                {p.title}
              </Link>
            ) : p.live ? (
              <a href={p.live} target='_blank' rel='noopener noreferrer' className='inline-flex min-h-11 items-center before:absolute before:inset-0'>
                {p.title}
              </a>
            ) : (
              p.title
            )}
          </Heading>
          <Text size='sm' className='mt-2 sm:line-clamp-3'>
            {p.summary}
          </Text>
          {p.metric && <p className='mt-3 text-sm font-semibold text-accent'>{p.metric}</p>}
          {p.caseStudy && (
            <span className='mt-3 inline-flex items-center gap-1.5 text-sm font-semibold'>
              Read the case study <Arrow />
            </span>
          )}
          <TagList items={p.stack} className='mt-auto pt-4' />
        </li>
      ))}
    </ul>
  )
}
