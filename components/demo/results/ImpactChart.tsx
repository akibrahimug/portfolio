import type { getImpact } from '@/lib/demo/catalog'
import { GrowBar } from '@/components/motion/GrowBar'
import { Text } from '@/components/ui/Typography'
import { FigureText } from '@/components/ui/FigureText'

export function ImpactChart({ output }: { output: ReturnType<typeof getImpact> }) {
  return (
    <div>
      <div className='stagger grid gap-x-10 gap-y-7 sm:grid-cols-2'>
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
      <Text size='sm' className='mt-8 border-t border-border pt-5'>
        <FigureText
          text={`All of it at the scale of ${output.scale
            .map((s) => `${s.value}${s.suffix} ${s.label.toLowerCase()}`)
            .join(', ')
            .replace(/, ([^,]*)$/, ' and $1')}.`}
        />
      </Text>
    </div>
  )
}
