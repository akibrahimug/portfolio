import type { getExperience } from '@/lib/demo/catalog'
import { Heading, Text } from '@/components/ui/Typography'
import { BulletList } from '@/components/ui/Lists'

export function Timeline({ output }: { output: ReturnType<typeof getExperience> }) {
  if (!output.roles.length) return <Text size='sm'>No roles on this site match that.</Text>
  return (
    <ol className='border-l border-border'>
      {output.roles.map((r) => (
        <li key={`${r.company}-${r.period}`} className='relative pb-6 pl-6 last:pb-0'>
          <span className='absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-accent' aria-hidden />
          <p className='text-xs uppercase tracking-wider text-faint'>
            {r.period} · {r.place}
          </p>
          <Heading level={4} size='xs' className='mt-1'>
            {r.title ? `${r.title} · ` : ''}
            {r.company}
          </Heading>
          <BulletList items={r.highlights} className='mt-2' />
        </li>
      ))}
    </ol>
  )
}
