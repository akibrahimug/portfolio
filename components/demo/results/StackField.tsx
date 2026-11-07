import type { getStack } from '@/lib/demo/catalog'
import { Text, Eyebrow } from '@/components/ui/Typography'
import { cn } from '@/components/ui/cn'

/** Type size and weight scale with depth of experience — the hierarchy is the data. */
const tier = (c: number | null) =>
  c === null
    ? 'text-base text-muted-foreground'
    : c >= 90
      ? 'text-2xl text-foreground md:text-3xl'
      : c >= 78
        ? 'text-xl text-foreground/85'
        : 'text-base text-muted-foreground'

export function StackField({ output }: { output: ReturnType<typeof getStack> }) {
  if (!output.tech.length && !output.groups.length) {
    return <Text size='sm'>That isn&apos;t listed in Ibrahim&apos;s stack on this site.</Text>
  }
  return (
    <div>
      {output.tech.length > 0 && (
        <ul className='stagger flex flex-wrap items-baseline gap-x-6 gap-y-2'>
          {output.tech.map((t) => (
            <li key={t.name} className={cn('font-display leading-tight', tier(t.confidence))}>
              {t.name}
              {t.experience && <span className='ml-1.5 align-middle text-[11px] font-sans text-faint'>{t.experience}</span>}
            </li>
          ))}
        </ul>
      )}
      {output.groups.length > 0 && (
        <dl className='mt-6 grid gap-x-8 gap-y-3 border-t border-border pt-5 sm:grid-cols-2'>
          {output.groups.map((g) => (
            <div key={g.label}>
              <Eyebrow as='dt' className='tracking-wider'>
                {g.label}
              </Eyebrow>
              <dd className='mt-1 text-sm text-muted-foreground'>{g.items.join(' · ')}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
