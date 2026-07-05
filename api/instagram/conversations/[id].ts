import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getValidToken, igPost } from '../../_lib/instagram.js'
import { getRecipientId, removeCachedConversation } from '../../_lib/cache.js'
import { requireAuth } from '../../_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return

  const id = req.query.id
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Falta el id de la conversación' })
    return
  }

  if (req.method === 'DELETE') {
    await removeCachedConversation(id)
    res.status(200).json({ ok: true })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const { text } = (req.body ?? {}) as { text?: string }
  if (typeof text !== 'string' || !text.trim()) {
    res.status(400).json({ error: 'Falta el texto de la respuesta' })
    return
  }

  try {
    const recipientId = await getRecipientId(id)
    if (!recipientId) {
      res.status(404).json({ error: 'No se encontró el destinatario de esta conversación' })
      return
    }

    const token = await getValidToken()
    await igPost(`/${token.igUserId}/messages`, token.accessToken, {
      recipient: JSON.stringify({ id: recipientId }),
      message: JSON.stringify({ text }),
    })
    await removeCachedConversation(id)
    res.status(200).json({ ok: true })
  } catch (e) {
    console.error('POST /api/instagram/conversations/[id] failed', e)
    res.status(500).json({ error: (e as Error).message })
  }
}
