import { kv } from './kv.js'
import type { PendingComment } from '../../src/comments'
import type { PendingDm, DmMessage } from '../../src/dms'
import type { PersonalityConfig } from '../../src/personality'

const COMMENTS_KEY = 'ig:cache:comments'
const CONVERSATIONS_KEY = 'ig:cache:conversations'
const RECIPIENTS_KEY = 'ig:cache:recipients'
const PERSONALITY_KEY = 'ig:personality'

/** Server-side copy of the "Tu personalidad" config, mirrored from the browser's localStorage so automations (n8n) can read the same system prompt. */
export async function getPersonalityConfig(): Promise<PersonalityConfig | null> {
  return (await kv().get<PersonalityConfig>(PERSONALITY_KEY)) ?? null
}

export async function setPersonalityConfig(config: PersonalityConfig): Promise<void> {
  await kv().set(PERSONALITY_KEY, config)
}

export async function getCachedComments(): Promise<PendingComment[]> {
  return (await kv().get<PendingComment[]>(COMMENTS_KEY)) ?? []
}

export async function setCachedComments(items: PendingComment[]): Promise<void> {
  await kv().set(COMMENTS_KEY, items)
}

export async function upsertCachedComment(item: PendingComment): Promise<void> {
  const items = await getCachedComments()
  await setCachedComments([item, ...items.filter(i => i.id !== item.id)])
}

export async function removeCachedComment(id: string): Promise<void> {
  const items = await getCachedComments()
  await setCachedComments(items.filter(i => i.id !== id))
}

export async function getCachedConversations(): Promise<PendingDm[]> {
  return (await kv().get<PendingDm[]>(CONVERSATIONS_KEY)) ?? []
}

export async function setCachedConversations(items: PendingDm[]): Promise<void> {
  await kv().set(CONVERSATIONS_KEY, items)
}

export async function upsertCachedConversation(item: PendingDm): Promise<void> {
  const items = await getCachedConversations()
  await setCachedConversations([item, ...items.filter(i => i.id !== item.id)])
}

/** Appends a new message to a conversation's history instead of replacing it, so real-time webhook events don't wipe out prior context. */
export async function appendConversationMessage(
  preview: Omit<PendingDm, 'messages'>,
  message: DmMessage,
): Promise<void> {
  const items = await getCachedConversations()
  const existing = items.find(i => i.id === preview.id)
  const messages = existing ? [...existing.messages, message] : [message]
  const updated: PendingDm = { ...preview, conversationId: preview.conversationId ?? existing?.conversationId, messages }
  await setCachedConversations([updated, ...items.filter(i => i.id !== preview.id)])
}

export async function removeCachedConversation(id: string): Promise<void> {
  const items = await getCachedConversations()
  await setCachedConversations(items.filter(i => i.id !== id))
}

/** Maps a conversation id to the sender's Instagram-scoped id (IGSID), needed to send a reply. Never exposed to the frontend. */
export async function setRecipientId(conversationId: string, igsid: string): Promise<void> {
  const map = (await kv().get<Record<string, string>>(RECIPIENTS_KEY)) ?? {}
  map[conversationId] = igsid
  await kv().set(RECIPIENTS_KEY, map)
}

export async function getRecipientId(conversationId: string): Promise<string | undefined> {
  const map = (await kv().get<Record<string, string>>(RECIPIENTS_KEY)) ?? {}
  return map[conversationId]
}
