import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { caseStudies, getCaseStudy } from '@/lib/case-studies'
import { getImpact } from '@/lib/demo/catalog'
import { Container } from '@/components/ui/Container'
import { Heading, Text, Eyebrow } from '@/components/ui/Typography'
import { ButtonLink, Arrow } from '@/components/ui/Button'
import { BulletList, TagList } from '@/components/ui/Lists'
import { CaseShot } from '@/components/case-study/CaseShot'
import { MetricRow } from '@/components/case-study/MetricRow'
import { ImpactChart } from '@/components/demo/results/ImpactChart'

type Params = { params: Promise<{ slug: string }> }

export const dynamicParams = false
export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = getCaseStudy((await params).slug)
  if (!c) return {}
  const title = `${c.title}: case study · Ibrahim Kasoma`
  return {
    title,
    description: c.lede,
    alternates: { canonical: `/work/${c.slug}` },
    openGraph: { type: 'article', title, description: c.lede, url: `/work/${c.slug}`, images: [{ url: c.image, alt: c.imageAlt }] },
    twitter: { card: 'summary_large_image', title, description: c.lede, images: [c.image] },
  }
}

/** One labelled chapter of the case study: label column left, prose right. */
function Chapter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className='grid gap-4 border-t border-border py-10 md:grid-cols-12 md:gap-6 md:py-14'>
      <Heading level={2} size='sm' className='md:col-span-4'>
        {label}
      </Heading>
      <div className='md:col-span-8'>{children}</div>
    </section>
  )
}

export default async function CaseStudyPage({ params }: Params) {
  const c = getCaseStudy((await params).slug)
  if (!c) notFound()
  const index = caseStudies.indexOf(c)
  const next = caseStudies[(index + 1) % caseStudies.length]
  const impact = c.impactKeys?.length
    ? { ...getImpact(), compares: getImpact().compares.filter((m) => c.impactKeys!.includes(m.key)) }
    : null

  return (
    <main>
      <article>
        <Container className='pt-28 md:pt-36'>
          <Link href='/#work' className='inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground'>
            <span aria-hidden>←</span> All case studies
          </Link>
          <Eyebrow className='mt-8'>
            {c.origin === 'ef' ? 'EF Education First' : 'Independent'} · {c.period}
          </Eyebrow>
          <Heading level={1} size='xl' className='mt-4 max-w-4xl'>
            {c.title}
          </Heading>
          <Text size='lead' className='mt-5 max-w-2xl'>
            {c.lede}
          </Text>
          <div className='mt-8 flex flex-wrap gap-3'>
            {c.live && (
              <ButtonLink href={c.live} target='_blank' rel='noopener noreferrer'>
                Visit the live site
                <Arrow dir='out' />
              </ButtonLink>
            )}
            {c.repo && (
              <ButtonLink href={c.repo} target='_blank' rel='noopener noreferrer' variant='outline'>
                Read the code
                <Arrow dir='out' />
              </ButtonLink>
            )}
          </div>
        </Container>

        <Container className='mt-12'>
          <CaseShot slug={c.slug} src={c.image} alt={c.imageAlt} priority sizes='(max-width: 1312px) 100vw, 1248px' />
        </Container>

        <Container className='mt-12'>
          <MetricRow metrics={c.metrics} />
        </Container>

        <Container className='mt-16'>
          <Chapter label='The project'>
            <Text size='lead'>{c.context}</Text>
            <dl className='mt-6 grid gap-4 text-sm sm:grid-cols-2'>
              <div>
                <Eyebrow as='dt'>Role</Eyebrow>
                <dd className='mt-1 text-muted-foreground'>{c.role}</dd>
              </div>
              <div>
                <Eyebrow as='dt'>Stack</Eyebrow>
                <dd className='mt-1'>
                  <TagList items={c.stack} className='gap-x-3' />
                </dd>
              </div>
            </dl>
          </Chapter>
          <Chapter label='The problem'>
            <Text size='lead'>{c.problem}</Text>
          </Chapter>
          <Chapter label='What I did'>
            <BulletList items={c.approach} className='[&_li]:text-base' />
          </Chapter>
          <Chapter label='What changed'>
            <Text size='lead'>{c.outcome}</Text>
            {impact && (
              <div className='mt-10'>
                <ImpactChart output={impact} />
              </div>
            )}
          </Chapter>
        </Container>

        <Container className='mt-8 pb-24'>
          <Link href={`/work/${next.slug}`} transitionTypes={['to-case']} className='group grid gap-6 border-t border-border pt-10 md:grid-cols-12 md:gap-6'>
            <div className='md:col-span-5'>
              <Eyebrow>Next case study</Eyebrow>
              <Heading level={2} size='lg' className='mt-3 group-hover:text-accent'>
                {next.title}
              </Heading>
              <Text className='mt-3'>{next.lede}</Text>
            </div>
            <div className='md:col-span-7'>
              <CaseShot slug={next.slug} src={next.image} alt='' sizes='(max-width: 768px) 100vw, 58vw' />
            </div>
          </Link>
        </Container>
      </article>
    </main>
  )
}
