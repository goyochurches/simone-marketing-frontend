import type { VercelRequest, VercelResponse } from '@vercel/node'
import { exchangeCodeForShortLivedToken, exchangeForLongLivedToken, getMyProfile, setToken } from '../../_lib/instagram.js'
import { isAuthenticated } from '../../_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const appUrl = process.env.APP_URL ?? '/'

  if (!isAuthenticated(req)) {
    res.redirect(`${appUrl}?ig_connected=0`)
    return
  }

  const code = req.query.code
  const error = req.query.error

  if (error || typeof code !== 'string') {
    res.redirect(`${appUrl}?ig_connected=0`)
    return
  }

  try {
    const short = await exchangeCodeForShortLivedToken(code)
    const long = await exchangeForLongLivedToken(short.access_token)
    const profile = await getMyProfile(long.access_token)
    await setToken({
      accessToken: long.access_token,
      igUserId: profile.id,
      igUsername: profile.username,
      expiresAt: Date.now() + long.expires_in * 1000,
    })
    res.redirect(`${appUrl}?ig_connected=1`)
  } catch (e) {
    console.error('Instagram OAuth callback failed', e)
    res.redirect(`${appUrl}?ig_connected=0`)
  }
}
