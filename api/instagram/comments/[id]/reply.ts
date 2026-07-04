import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getValidToken, igPost } from '../../../_lib/instagram.js'
import { removeCachedComment } from '../../../_lib/cache.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const id = req.query.id
  const { text } = (req.body ?? {}) as { text?: string }
  if (typeof id !== 'string' || typeof text !== 'string' || !text.trim()) {
    res.status(400).json({ error: 'Falta el id del comentario o el texto de la respuesta' })
    return
  }

  try {
    const token = await getValidToken()
    await igPost(`/${id}/replies`, token.accessToken, { message: text })
    await removeCachedComment(id)
    res.status(200).json({ ok: true })
  } catch (e) {
    console.error('POST /api/instagram/comments/[id]/reply failed', e)
    res.status(500).json({ error: (e as Error).message })
  }
}
