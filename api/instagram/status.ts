import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getToken, deleteToken, igGet } from '../_lib/instagram.js'
import { requireAuth } from '../_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return

  if (req.method === 'DELETE') {
    await deleteToken()
    res.status(200).json({ ok: true })
    return
  }

  const token = await getToken()
  if (!token) {
    res.status(200).json({ connected: false, expiresAt: null })
    return
  }

  try {
    const me = await igGet(`/${token.igUserId}`, token.accessToken, {
      fields: 'username,name,followers_count,media_count',
    })
    res.status(200).json({
      connected: true,
      expiresAt: token.expiresAt,
      handle: `@${me.username}`,
      name: me.name ?? me.username,
      followers: me.followers_count ?? 0,
      posts: me.media_count ?? null,
      followersPerPost: me.media_count ? Math.round((me.followers_count / me.media_count) * 10) / 10 : null,
    })
  } catch (e) {
    console.error('GET /api/instagram/status account lookup failed', e)
    res.status(200).json({ connected: true, expiresAt: token.expiresAt })
  }
}
