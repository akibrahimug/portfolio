import Link from 'next/link'
import Image from 'next/image'
import { caseStudies, moreWork } from '@/lib/case-studies'
import { Section } from '@/components/patterns/Section'
import { CaseShot } from '@/components/case-study/CaseShot'
import { MetricRow } from '@/components/case-study/MetricRow'
import { Heading, Text, Eyebrow } from '@/components/ui/Typography'
import { TextLink } from '@/components/ui/TextLink'
import { TagList } from '@/components/ui/Lists'

export function CaseStudies() {
  return (
    <Section id='work'>
      <Section.Header index='02' eyebrow='Selected work'>
        <Section.Title>
          Five case studies, <em>in depth.</em>
        </Section.Title>
        <Section.Intro>
          Three from EF Education First, where the work runs at the scale of millions of users, and two of my own: an
          AI product and a design system built for coding agents.
        </Section.Intro>
      </Section.Header>
      <Section.Body>
        <ol className='space-y-16 md:space-y-24'>
          {caseStudies.map((c, i) => (
            <li key={c.slug}>
              <article className='group grid gap-6 md:grid-cols-12 md:gap-6'>
                <Link
                  href={`/work/${c.slug}`}
                  transitionTypes={['to-case']}
                  className='block md:col-span-7'
                  tabIndex={-1}
                  aria-hidden
                >
                  <CaseShot slug={c.slug} src={c.image} alt='' sizes='(max-width: 768px) 100vw, 58vw' />
                </Link>
                <div className='flex flex-col md:col-span-5'>
                  <Eyebrow>
                    <span className='text-accent'>{String(i + 1).padStart(2, '0')}</span>
                    <span className='mx-2'>·</span>
                    {c.origin === 'ef' ? 'EF Education First' : 'Independent'}
                  </Eyebrow>
                  <Heading level={3} size='md' className='mt-3'>
                    <Link
                      href={`/work/${c.slug}`}
                      transitionTypes={['to-case']}
                      className='underline decoration-transparent decoration-1 underline-offset-[6px] transition-colors hover:decoration-accent'
                    >
                      {c.title}
                    </Link>
                  </Heading>
                  <Text className='mt-3'>{c.lede}</Text>
                  <MetricRow metrics={c.metrics.slice(0, 3)} size='sm' className='mt-6' />
                  <TagList items={c.stack} className='mt-6 gap-x-3' />
                  <TextLink
                    href={`/work/${c.slug}`}
                    variant='action'
                    className='mt-6 inline-flex min-h-11 items-center gap-2 self-start font-medium text-foreground'
                    aria-label={`Read the ${c.title} case study`}
                  >
                    Read the case study <span aria-hidden>→</span>
                  </TextLink>
                </div>
              </article>
            </li>
          ))}
        </ol>

        <div className='mt-24 border-t border-border pt-10'>
          <Heading level={3} size='sm'>
            More work
          </Heading>
          <ul className='mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {moreWork.map((p) => (
              <li key={p.slug} className='group relative'>
                <div className='relative aspect-[16/10] overflow-hidden border border-border bg-muted'>
                  <Image
                    src={`/projects/${p.slug}.webp`}
                    alt=''
                    fill
                    sizes='(max-width: 640px) 100vw, 25vw'
                    className='object-cover object-top transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]'
                  />
                </div>
                <Eyebrow as='span' className='mt-3 block tracking-wider'>
                  {p.kind}
                </Eyebrow>
                <Heading level={4} size='xs' className='mt-1 group-hover:text-accent'>
                  <a href={p.live} target='_blank' rel='noopener noreferrer' className='before:absolute before:inset-0'>
                    {p.title}
                  </a>
                </Heading>
                <Text size='sm' className='mt-1 line-clamp-2'>
                  {p.summary}
                </Text>
              </li>
            ))}
          </ul>
        </div>
      </Section.Body>
    </Section>
  )
}
