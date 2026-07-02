import { useState } from 'react'
import { generateReply } from '../lib/groq'

export type DraftState = {
  text: string
  status: 'idle' | 'loading' | 'ready' | 'error'
  error?: string
}

export interface DraftableItem {
  id: string
  /** Full text sent to the model as the user turn — include any post/context prefix here. */
  prompt: string
}

export function useDraftReplies(systemPrompt: string) {
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({})
  const [bulkRunning, setBulkRunning] = useState(false)

  async function generateOne(apiKey: string, item: DraftableItem) {
    if (!apiKey) return
    setDrafts(prev => ({ ...prev, [item.id]: { text: '', status: 'loading' } }))
    try {
      const text = await generateReply(apiKey, systemPrompt, item.prompt)
      setDrafts(prev => ({ ...prev, [item.id]: { text, status: 'ready' } }))
    } catch (e) {
      setDrafts(prev => ({ ...prev, [item.id]: { text: '', status: 'error', error: (e as Error).message } }))
    }
  }

  async function generateAll(apiKey: string, items: DraftableItem[]) {
    if (!apiKey || bulkRunning) return
    setBulkRunning(true)
    for (const item of items) {
      await generateOne(apiKey, item)
    }
    setBulkRunning(false)
  }

  function editDraft(id: string, text: string) {
    setDrafts(prev => ({ ...prev, [id]: { ...(prev[id] ?? { status: 'ready' }), text, status: 'ready' } }))
  }

  return { drafts, bulkRunning, generateOne, generateAll, editDraft }
}
