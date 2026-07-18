import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getValidToken, igGet, colorForId, NotConnectedError } from '../_lib/instagram.js'
import { getCachedComments, getCachedCommentsAge, setCachedComments } from '../_lib/cache.js'
import { requireAuth } from '../_lib/auth.js'
import type { PendingComment } from '../../src/comments'

const CACHE_TTL_MS = 6 * 60 * 60 * 1000

async function backfillComments(token: string, igUsername: string): Promise<PendingComment[]> {
  const media = await igGet('/me/media', token, { fields: 'id,caption,media_url,thumbnail_url', limit: '15' })
  const items: PendingComment[] = []
  for (const m of media.data ?? []) {
    const comments = await igGet(`/${m.id}/comments`, token, { fields: 'id,text,from,timestamp', limit: '10' })
    for (const c of comments.data ?? []) {
      if (c.from?.username === igUsername) continue
      items.push({
        id: c.id,
        from: c.from?.username ?? 'Instagram',
        handle: `@${c.from?.username ?? ''}`,
        comment: c.text,
        receivedAt: c.timestamp,
        post: {
          productName: m.caption ? m.caption.slice(0, 40) : 'Publicación',
          caption: m.caption ?? '',
          color: colorForId(m.id),
          mediaUrl: m.thumbnail_url ?? m.media_url,
        },
      })
    }
  }
  return items
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return
  try {
    const token = await getValidToken()
    let items = await getCachedComments()
    const age = await getCachedCommentsAge()
    if (items.length === 0 || age === null || age > CACHE_TTL_MS) {
      items = await backfillComments(token.accessToken, token.igUsername)
      await setCachedComments(items)
    }
    res.status(200).json(items)
  } catch (e) {
    if (e instanceof NotConnectedError) {
      res.status(200).json([])
      return
    }
    console.error('GET /api/instagram/comments failed', e)
    res.status(500).json({ error: (e as Error).message })
  }
}
