import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getValidToken, igGet, describeMessage, NotConnectedError } from '../_lib/instagram.js'
import { getCachedConversations, setCachedConversations, setRecipientId } from '../_lib/cache.js'
import { requireAuth } from '../_lib/auth.js'
import type { PendingDm, DmMessage } from '../../src/dms'

async function backfillConversations(token: string, igUserId: string, igUsername: string): Promise<PendingDm[]> {
  // Only the last message per conversation here — asking for full history across every conversation
  // at once gets rejected by the API ("reduce the amount of data"). Full threads load on demand.
  const convos = await igGet(`/${igUserId}/conversations`, token, {
    platform: 'instagram',
    fields: 'id,participants,messages.limit(1){message,from,created_time,attachments,shares,story,reactions}',
  })

  const items: PendingDm[] = []
  for (const c of convos.data ?? []) {
    const lastMsg = c.messages?.data?.[0]
    // Participant/message "from" ids here use a different id scheme than /me returns for the same account, so match by username instead.
    const other = c.participants?.data?.find((p: any) => p.username !== igUsername)
    if (!lastMsg || !other || lastMsg.from?.username === igUsername) continue

    const message: DmMessage = {
      id: lastMsg.id,
      text: describeMessage(lastMsg),
      fromMe: false,
      timestamp: lastMsg.created_time,
    }

    await setRecipientId(other.id, other.id)
    items.push({
      id: other.id,
      from: other.username ?? other.id,
      handle: `@${other.username ?? other.id}`,
      message: message.text,
      receivedAt: lastMsg.created_time,
      conversationId: c.id,
      messages: [message],
    })
  }
  return items
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return
  try {
    const token = await getValidToken()
    let items = await getCachedConversations()
    if (items.length === 0) {
      items = await backfillConversations(token.accessToken, token.igUserId, token.igUsername)
      await setCachedConversations(items)
    }
    res.status(200).json(items)
  } catch (e) {
    if (e instanceof NotConnectedError) {
      res.status(200).json([])
      return
    }
    console.error('GET /api/instagram/conversations failed', e)
    res.status(500).json({ error: (e as Error).message })
  }
}
