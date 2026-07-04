import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getToken } from '../_lib/instagram.js'
import { requireAuth } from '../_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return
  const token = await getToken()
  res.status(200).json({ connected: !!token, expiresAt: token?.expiresAt ?? null })
}
