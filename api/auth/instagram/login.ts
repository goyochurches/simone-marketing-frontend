import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireAuth } from '../../_lib/auth.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return
  const url = new URL('https://www.instagram.com/oauth/authorize')
  url.searchParams.set('client_id', process.env.IG_APP_ID!)
  url.searchParams.set('redirect_uri', process.env.IG_REDIRECT_URI!)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set(
    'scope',
    'instagram_business_basic,instagram_business_manage_comments,instagram_business_manage_messages',
  )
  res.redirect(url.toString())
}
