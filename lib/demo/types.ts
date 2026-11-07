import type { InferUITools, UIMessage } from 'ai'
import type { demoTools } from './tools'

/** Per-answer facts for the "show how" margin notes. */
export type DemoMetadata = {
  /** Which rung of the chain answered: a live model, or the model-free offline router. */
  /** live model · model-free offline router · the example answer rendered with the page */
  source?: 'live' | 'offline' | 'example'
  provider?: string
  model?: string
  /** Why the offline router answered, when it did. */
  offlineReason?: 'quota' | 'rate-limit' | 'unavailable'
  /** Providers tried and skipped before this one answered. */
  skipped?: string[]
  firstTokenMs?: number
  totalMs?: number
}

export type DemoUIMessage = UIMessage<DemoMetadata, never, InferUITools<typeof demoTools>>
