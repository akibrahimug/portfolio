import type { getContact } from '@/lib/demo/catalog'
import { ButtonLink, Arrow } from '@/components/ui/Button'
import { TextLink } from '@/components/ui/TextLink'

export function ContactCard({ output }: { output: ReturnType<typeof getContact> }) {
  return (
    <div>
      <div className='stagger flex flex-wrap items-center gap-3'>
        <ButtonLink href={`mailto:${output.email}`}>
          Email Ibrahim
          <Arrow />
        </ButtonLink>
        <ButtonLink href={output.cv} variant='outline' download>
          Download CV
          <Arrow dir='down' />
        </ButtonLink>
      </div>
      <ul className='mt-5 flex flex-wrap gap-x-6 gap-y-2'>
        {output.socials.map((s) => (
          <li key={s.href}>
            <TextLink variant='action' external href={s.href}>
              {s.label} ↗
            </TextLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
