import { redesignContent as c } from '@/lib/redesign-content'
import { caseStudies, moreWork } from '@/lib/case-studies'
import { careerTotals } from '@/lib/demo/catalog'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-static'

/**
 * /llms.txt for AI crawlers and answer engines — generated from the same content as the
 * pages, so it can't drift (the hand-written file had gone stale).
 */
export function GET() {
  const t = careerTotals()
  const ef = c.experience.roles[0]
  const body = `# Ibrahim Kasoma

> ${c.meta.description}

Key facts:

- Current role: ${ef.title} at ${ef.company} (${ef.place}), ${ef.period.replace('–', ' – ')}.
- Experience: about ${t.yearsProfessional} years of professional frontend work, since ${t.professionalSince}.
- Measured results at EF: ${c.impact.compares.map((m) => m.plain.replace(/\.$/, '')).join('; ')}.
- Core stack: ${c.skills.groups.flatMap((g) => g.items).slice(0, 14).join(', ')}.
- Contact: ${c.contact.email}

## Site

- [Portfolio home](${SITE_URL}/): a live AI demo that answers questions about this work, case studies, experience and contact.

## Case studies

${caseStudies.map((s) => `- [${s.title}](${SITE_URL}/work/${s.slug}): ${s.lede}`).join('\n')}

## More work

${moreWork.map((p) => `- [${p.title}](${p.live}): ${p.summary.split('. ')[0].replace(/\.$/, '')}.`).join('\n')}

## Profiles

${c.contact.socials.map((s) => `- [${s.label}](${s.href})`).join('\n')}
`
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
