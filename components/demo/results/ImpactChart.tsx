import type { getImpact } from '@/lib/demo/catalog'
import { GrowBar } from '@/components/motion/GrowBar'
import { Text } from '@/components/ui/Typography'

export function ImpactChart({ output }: { output: ReturnType<typeof getImpact> }) {
  return (
    <div>
      <div className='grid gap-x-10 gap-y-7 sm:grid-cols-2'>
        {output.compares.map((c) => (
          <div key={c.key}>
            <div className='flex items-baseline justify-between gap-4'>
              <span className='font-display text-lg'>{c.label}</span>
              <span className='font-display text-xl text-accent'>{c.delta}</span>
            </div>
            <Text size='sm' className='mt-1'>
              {c.caption}
            </Text>
            <div className='mt-3 space-y-1.5'>
              <GrowBar pct={c.before.pct} value={c.before.value} />
              <GrowBar pct={c.after.pct} value={c.after.value} accent delay={0.12} />
            </div>
          </div>
        ))}
      </div>
      <dl className='mt-8 grid grid-cols-3 gap-4 border-t border-border pt-5'>
        {output.scale.map((s) => (
          <div key={s.label} className='flex flex-col-reverse'>
            <dt className='mt-1 text-[11px] uppercase tracking-wider text-faint'>{s.label}</dt>
            <dd className='font-display text-2xl'>
              {s.value}
              {s.suffix}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
