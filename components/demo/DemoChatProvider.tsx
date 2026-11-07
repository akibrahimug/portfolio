'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { Chat, useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { DemoUIMessage } from '@/lib/demo/types'

const DemoChatContext = createContext<Chat<DemoUIMessage> | null>(null)

/**
 * One conversation for the whole site: the live-demo section and the sticky ask bar are two
 * surfaces of the same chat, so a question asked in one is there when you open the other.
 */
export function DemoChatProvider({ children }: { children: ReactNode }) {
  const [chat] = useState(() => new Chat<DemoUIMessage>({ transport: new DefaultChatTransport({ api: '/api/demo' }) }))
  return <DemoChatContext.Provider value={chat}>{children}</DemoChatContext.Provider>
}

export function useDemoChat() {
  const chat = useContext(DemoChatContext)
  if (!chat) throw new Error('useDemoChat must be used inside <DemoChatProvider>')
  return useChat<DemoUIMessage>({ chat })
}
