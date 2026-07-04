import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getValidToken, igGet, NotConnectedError } from '../_lib/instagram.js'
import { requireAuth } from '../_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return
  try {
    const token = await getValidToken()
    const me = await igGet(`/${token.igUserId}`, token.accessToken, {
      fields: 'username,name,followers_count,media_count',
    })
    res.status(200).json({
      handle: `@${me.username}`,
      name: me.name ?? me.username,
      followers: me.followers_count ?? 0,
      posts: me.media_count ?? null,
      followersPerPost: me.media_count ? Math.round((me.followers_count / me.media_count) * 10) / 10 : null,
    })
  } catch (e) {
    if (e instanceof NotConnectedError) {
      res.status(200).json(null)
      return
    }
    console.error('GET /api/instagram/account failed', e)
    res.status(500).json({ error: (e as Error).message })
  }
}
