import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getPersonalityConfig, setPersonalityConfig } from './_lib/cache.js'
import { isAuthenticated, requireAuth } from './_lib/auth.js'
import { buildSystemPrompt, defaultPersonality, type PersonalityConfig } from '../src/personality.js'

/** Read access for GET is shared between the logged-in browser and server-to-server callers (e.g. n8n) that present AUTOMATION_API_KEY, since there's no session cookie in that case. */
function canRead(req: VercelRequest): boolean {
  if (isAuthenticated(req)) return true
  const key = req.query.key
  return typeof key === 'string' && !!process.env.AUTOMATION_API_KEY && key === process.env.AUTOMATION_API_KEY
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    if (!requireAuth(req, res)) return
    const config = req.body as PersonalityConfig
    if (!config || typeof config.description !== 'string') {
      res.status(400).json({ error: 'Configuración de personalidad inválida' })
      return
    }
    await setPersonalityConfig(config)
    res.status(200).json({ ok: true })
    return
  }

  if (req.method !== 'GET') {
    res.status(405).end()
    return
  }

  if (!canRead(req)) {
    res.status(401).json({ error: 'No autenticado' })
    return
  }

  const config = (await getPersonalityConfig()) ?? defaultPersonality
  res.status(200).json({ systemPrompt: buildSystemPrompt(config) })
}
