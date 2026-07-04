import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getValidToken, igGet, NotConnectedError } from '../_lib/instagram.js'
import { getCachedConversations, setCachedConversations, setRecipientId } from '../_lib/cache.js'
import type { PendingDm } from '../../src/dms'

async function backfillConversations(token: string, igUserId: string): Promise<PendingDm[]> {
  const convos = await igGet(`/${igUserId}/conversations`, token, {
    platform: 'instagram',
    fields: 'participants,messages.limit(1){message,from,created_time}',
  })

  const items: PendingDm[] = []
  for (const c of convos.data ?? []) {
    const lastMsg = c.messages?.data?.[0]
    const other = c.participants?.data?.find((p: any) => p.id !== igUserId)
    if (!lastMsg || !other || lastMsg.from?.id === igUserId) continue

    await setRecipientId(other.id, other.id)
    items.push({
      id: other.id,
      from: other.username ?? other.id,
      handle: `@${other.username ?? other.id}`,
      message: lastMsg.message ?? '',
      receivedAt: lastMsg.created_time,
    })
  }
  return items
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const token = await getValidToken()
    let items = await getCachedConversations()
    if (items.length === 0) {
      items = await backfillConversations(token.accessToken, token.igUserId)
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
