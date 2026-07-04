import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'node:crypto'
import { createSessionCookie } from '../_lib/auth.js'

function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  if (!process.env.APP_LOGIN_USER || !process.env.APP_LOGIN_PASSWORD || !process.env.APP_SESSION_SECRET) {
    res.status(500).json({ error: 'El login no está configurado en el servidor' })
    return
  }

  const { username, password } = (req.body ?? {}) as { username?: string; password?: string }
  const validUser = typeof username === 'string' && timingSafeEqualStr(username, process.env.APP_LOGIN_USER)
  const validPass = typeof password === 'string' && timingSafeEqualStr(password, process.env.APP_LOGIN_PASSWORD)

  if (!validUser || !validPass) {
    res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
    return
  }

  res.setHeader('Set-Cookie', createSessionCookie(username as string))
  res.status(200).json({ ok: true })
}
