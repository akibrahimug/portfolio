import type { ComponentType } from 'react'
import type { DemoToolName } from '@/lib/demo/tools'
import type * as catalog from '@/lib/demo/catalog'
import { CaseCards } from './CaseCards'
import { ImpactChart } from './ImpactChart'
import { Timeline } from './Timeline'
import { StackField } from './StackField'
import { ContactCard } from './ContactCard'

type Outputs = {
  findWork: ReturnType<typeof catalog.findWork>
  getImpact: ReturnType<typeof catalog.getImpact>
  getExperience: ReturnType<typeof catalog.getExperience>
  getStack: ReturnType<typeof catalog.getStack>
  getContact: ReturnType<typeof catalog.getContact>
}

/**
 * Tool → the site component that renders its result. `satisfies` makes this exhaustive:
 * add a tool without a view and the build fails.
 */
export const RESULT_VIEWS = {
  findWork: CaseCards,
  getImpact: ImpactChart,
  getExperience: Timeline,
  getStack: StackField,
  getContact: ContactCard,
} satisfies { [K in DemoToolName]: ComponentType<{ output: Outputs[K] }> }

/** Display name of the component each tool renders, for the margin notes. */
export const VIEW_NAMES: Record<DemoToolName, string> = {
  findWork: 'CaseCards',
  getImpact: 'ImpactChart',
  getExperience: 'Timeline',
  getStack: 'StackField',
  getContact: 'ContactCard',
}
