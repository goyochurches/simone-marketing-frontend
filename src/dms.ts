export interface DmMessage {
  id: string
  text: string
  fromMe: boolean
  timestamp: string
}

export interface PendingDm {
  id: string
  from: string
  handle: string
  message: string
  receivedAt: string
  /** Instagram's own thread id — used to load the full history on demand. Unknown until the next backfill for conversations that arrived only via webhook. */
  conversationId?: string
  messages: DmMessage[]
}
