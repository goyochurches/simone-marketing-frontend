import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'node:crypto'

const COOKIE_NAME = 'simone_session'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

function sign(payload: string): string {
  return crypto.createHmac('sha256', process.env.APP_SESSION_SECRET!).update(payload).digest('hex')
}

export function createSessionCookie(username: string): string {
  const payload = Buffer.from(JSON.stringify({ u: username, exp: Date.now() + SESSION_TTL_MS })).toString(
    'base64url',
  )
  const token = `${payload}.${sign(payload)}`
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}`
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim())
  }
  return out
}

export function isAuthenticated(req: VercelRequest): boolean {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME]
  if (!token) return false

  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false

  const expected = sign(payload)
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return typeof exp === 'number' && exp > Date.now()
  } catch {
    return false
  }
}

/** Returns false and writes a 401 response when the request has no valid session — callers should `return` right after. */
export function requireAuth(req: VercelRequest, res: VercelResponse): boolean {
  if (isAuthenticated(req)) return true
  res.status(401).json({ error: 'No autenticado' })
  return false
}
