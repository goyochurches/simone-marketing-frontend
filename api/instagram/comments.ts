import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getValidToken, igGet, colorForId, NotConnectedError } from '../_lib/instagram.js'
import { getCachedComments, setCachedComments } from '../_lib/cache.js'
import { requireAuth } from '../_lib/auth.js'
import type { PendingComment } from '../../src/comments'

async function backfillComments(token: string): Promise<PendingComment[]> {
  const media = await igGet('/me/media', token, { fields: 'id,caption', limit: '15' })
  const items: PendingComment[] = []
  for (const m of media.data ?? []) {
    const comments = await igGet(`/${m.id}/comments`, token, { fields: 'id,text,from,timestamp', limit: '10' })
    for (const c of comments.data ?? []) {
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
    if (items.length === 0) {
      items = await backfillComments(token.accessToken)
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
