import Link from 'next/link'
import Image from 'next/image'
import { caseStudies, moreWork } from '@/lib/case-studies'
import { Section } from '@/components/patterns/Section'
import { CaseShot } from '@/components/case-study/CaseShot'
import { LeadFigure } from '@/components/case-study/LeadFigure'
import { Heading, Text, Eyebrow } from '@/components/ui/Typography'
import { TextLink } from '@/components/ui/TextLink'
import { TagList } from '@/components/ui/Lists'
import { Arrow } from '@/components/ui/Button'
import { cn } from '@/components/ui/cn'

/** A pale ground per project, as EF tints its programme cards. Static class names so Tailwind sees them. */
const TINT: Record<string, string> = {
  'ef-epi': 'bg-[oklch(0.965_0.045_98)]',
  'ef-pg': 'bg-[oklch(0.96_0.028_350)]',
  'ef-homepage': 'bg-[oklch(0.96_0.026_235)]',
  learner: 'bg-[oklch(0.962_0.032_160)]',
  'comp-lib': 'bg-[oklch(0.962_0.03_60)]',
}

export function CaseStudies() {
  return (
    <Section id='work'>
      <Section.Header>
        <Section.Title>
          Five case studies, in depth.
        </Section.Title>
        <Section.Intro>
          Three from EF Education First, where the work runs at the scale of millions of users, and two of my own: an
          AI product and a design system built for coding agents.
        </Section.Intro>
      </Section.Header>
      <Section.Body>
        <ol className='space-y-6'>
          {caseStudies.map((c) => (
            <li key={c.slug}>
              {/* One soft-tinted panel per project: words left, the picture right. */}
              <article
                className={cn(
                  'group grid items-start gap-8 rounded-3xl p-6 md:grid-cols-12 md:gap-6 md:p-10',
                  TINT[c.slug] ?? 'bg-card',
                )}
              >
                <div className='flex flex-col md:col-span-5 md:pr-4'>
                  <Eyebrow>{c.origin === 'ef' ? 'EF Education First' : 'Independent'}</Eyebrow>
                  <Heading level={3} size='lg'>
                    <Link
                      href={`/work/${c.slug}`}
                      transitionTypes={['to-case']}
                      className='inline-flex min-h-11 items-center underline decoration-transparent decoration-2 underline-offset-[6px] transition-colors hover:decoration-foreground'
                    >
                      {c.title}
                    </Link>
                  </Heading>
                  <Text size='lead' className='mt-2'>
                    {c.lede}
                  </Text>
                  {c.lead && <LeadFigure lead={c.lead} className='mt-6' />}
                  <TagList items={c.stack} className='mt-6 [&_li]:bg-background/70' />
                  <TextLink
                    href={`/work/${c.slug}`}
                    variant='action'
                    className='group/link mt-6 inline-flex min-h-11 items-center gap-2 self-start font-semibold text-foreground hover:text-foreground'
                    aria-label={`Read the ${c.title} case study`}
                  >
                    Read the case study <Arrow className='motion-safe:group-hover/link:translate-x-0.5' />
                  </TextLink>
                </div>
                <Link
                  href={`/work/${c.slug}`}
                  transitionTypes={['to-case']}
                  className='block md:col-span-7'
                  tabIndex={-1}
                  aria-hidden
                >
                  <CaseShot
                    slug={c.slug}
                    src={c.image}
                    alt=''
                    sizes='(max-width: 768px) 100vw, 52vw'
                    className='shadow-[0_18px_40px_-24px_rgb(0_0_0/0.35)]'
                  />
                </Link>
              </article>
            </li>
          ))}
        </ol>

        <div className='mt-20'>
          <Heading level={3} size='md'>
            More work
          </Heading>
          <ul className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {moreWork.map((p) => (
              <li
                key={p.slug}
                className='group relative overflow-hidden rounded-2xl border border-border bg-background transition-[border-color,transform] duration-200 hover:border-border-strong motion-safe:hover:-translate-y-0.5'
              >
                <div className='relative aspect-[16/10] overflow-hidden border-b border-border bg-muted'>
                  <Image
                    src={`/projects/${p.slug}.webp`}
                    alt=''
                    fill
                    sizes='(max-width: 640px) 100vw, 25vw'
                    className='object-cover object-top transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]'
                  />
                </div>
                <div className='p-5'>
                  <Eyebrow as='span' className='block text-xs'>
                    {p.kind}
                  </Eyebrow>
                  <Heading level={4} size='xs' className='mt-1'>
                    <a href={p.live} target='_blank' rel='noopener noreferrer' className='before:absolute before:inset-0'>
                      {p.title}
                    </a>
                  </Heading>
                  <Text size='sm' className='mt-1.5'>
                    {p.summary}
                  </Text>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section.Body>
    </Section>
  )
}
