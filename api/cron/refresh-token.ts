import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getToken, setToken, refreshLongLivedToken } from '../_lib/instagram.js'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const token = await getToken()
  if (!token) {
    res.status(200).json({ refreshed: false, reason: 'not connected' })
    return
  }
  try {
    const refreshed = await refreshLongLivedToken(token.accessToken)
    await setToken({
      ...token,
      accessToken: refreshed.access_token,
      expiresAt: Date.now() + refreshed.expires_in * 1000,
    })
    res.status(200).json({ refreshed: true })
  } catch (e) {
    // Meta requires the token to be at least 24h old before it can be refreshed — expected to fail the day after connecting.
    console.error('Instagram token refresh failed', e)
    res.status(200).json({ refreshed: false, error: (e as Error).message })
  }
}
