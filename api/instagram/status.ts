import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getToken, deleteToken } from '../_lib/instagram.js'
import { requireAuth } from '../_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return

  if (req.method === 'DELETE') {
    await deleteToken()
    res.status(200).json({ ok: true })
    return
  }

  const token = await getToken()
  res.status(200).json({ connected: !!token, expiresAt: token?.expiresAt ?? null })
}
