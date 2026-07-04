import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getToken } from '../_lib/instagram.js'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const token = await getToken()
  res.status(200).json({ connected: !!token, expiresAt: token?.expiresAt ?? null })
}
