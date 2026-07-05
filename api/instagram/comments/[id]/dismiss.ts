import type { VercelRequest, VercelResponse } from '@vercel/node'
import { removeCachedComment } from '../../../_lib/cache.js'
import { requireAuth } from '../../../_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }
  if (!requireAuth(req, res)) return

  const id = req.query.id
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Falta el id del comentario' })
    return
  }

  await removeCachedComment(id)
  res.status(200).json({ ok: true })
}
