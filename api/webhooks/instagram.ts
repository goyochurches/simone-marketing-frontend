import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'node:crypto'
import { getValidToken, igGet, colorForId, NotConnectedError } from '../_lib/instagram.js'
import { upsertCachedComment, upsertCachedConversation, setRecipientId } from '../_lib/cache.js'

export const config = { api: { bodyParser: false } }

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  return Buffer.concat(chunks)
}

function isValidSignature(rawBody: Buffer, signatureHeader: string | string[] | undefined): boolean {
  if (typeof signatureHeader !== 'string' || !process.env.IG_APP_SECRET) return false
  const expected = `sha256=${crypto.createHmac('sha256', process.env.IG_APP_SECRET).update(rawBody).digest('hex')}`
  const a = Buffer.from(expected)
  const b = Buffer.from(signatureHeader)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

async function handleCommentChange(token: string, value: any) {
  const mediaId = value?.media?.id
  const media = mediaId ? await igGet(`/${mediaId}`, token, { fields: 'caption' }).catch(() => null) : null
  const caption = media?.caption ?? ''
  await upsertCachedComment({
    id: value.id,
    from: value.from?.username ?? 'Instagram',
    handle: `@${value.from?.username ?? ''}`,
    comment: value.text ?? '',
    receivedAt: new Date().toISOString(),
    post: {
      productName: caption ? caption.slice(0, 40) : 'Publicación',
      caption,
      color: colorForId(mediaId ?? value.id),
    },
  })
}

async function handleMessagingEvent(token: string, event: any) {
  if (event?.message?.is_echo) return // messages we sent ourselves, not incoming ones
  const senderId = event?.sender?.id
  const text = event?.message?.text
  if (!senderId || !text) return

  const profile = await igGet(`/${senderId}`, token, { fields: 'name,username' }).catch(() => null)
  const username = profile?.username ?? senderId

  await setRecipientId(senderId, senderId)
  await upsertCachedConversation({
    id: senderId,
    from: profile?.name ?? username,
    handle: `@${username}`,
    message: text,
    receivedAt: new Date((event.timestamp ?? Date.now()) as number).toISOString(),
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode']
    const verifyToken = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']
    if (mode === 'subscribe' && verifyToken === process.env.IG_WEBHOOK_VERIFY_TOKEN) {
      res.status(200).send(String(challenge))
    } else {
      res.status(403).send('Forbidden')
    }
    return
  }

  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const rawBody = await readRawBody(req)
  if (!isValidSignature(rawBody, req.headers['x-hub-signature-256'])) {
    res.status(401).send('Invalid signature')
    return
  }

  let body: any
  try {
    body = JSON.parse(rawBody.toString('utf8'))
  } catch {
    res.status(400).send('Invalid JSON')
    return
  }

  // Process before responding — a serverless function isn't guaranteed to keep running once it sends its response.
  try {
    const { accessToken } = await getValidToken()
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field === 'comments') await handleCommentChange(accessToken, change.value)
      }
      for (const event of entry.messaging ?? []) {
        await handleMessagingEvent(accessToken, event)
      }
    }
  } catch (e) {
    if (!(e instanceof NotConnectedError)) console.error('Failed processing Instagram webhook event', e)
  }

  // Always 200 once the signature is valid — a non-200 makes Meta retry delivery for up to 36h.
  res.status(200).send('EVENT_RECEIVED')
}
