import { kv } from './kv.js'

const GRAPH_BASE = 'https://graph.instagram.com'
const AUTH_BASE = 'https://api.instagram.com'
const TOKEN_KEY = 'ig:token'

export interface IgToken {
  accessToken: string
  igUserId: string
  expiresAt: number
}

export class NotConnectedError extends Error {}

export async function getToken(): Promise<IgToken | null> {
  return (await kv().get<IgToken>(TOKEN_KEY)) ?? null
}

export async function setToken(token: IgToken): Promise<void> {
  await kv().set(TOKEN_KEY, token)
}

export async function getValidToken(): Promise<IgToken> {
  const token = await getToken()
  if (!token) throw new NotConnectedError('Instagram no está conectado')
  return token
}

export async function exchangeCodeForShortLivedToken(code: string) {
  const body = new URLSearchParams({
    client_id: process.env.IG_APP_ID!,
    client_secret: process.env.IG_APP_SECRET!,
    grant_type: 'authorization_code',
    redirect_uri: process.env.IG_REDIRECT_URI!,
    code,
  })
  const res = await fetch(`${AUTH_BASE}/oauth/access_token`, { method: 'POST', body })
  if (!res.ok) throw new Error(`Instagram token exchange failed: ${res.status} ${await res.text()}`)
  return res.json() as Promise<{ access_token: string; user_id: string }>
}

export async function exchangeForLongLivedToken(shortLivedToken: string) {
  const url = new URL(`${GRAPH_BASE}/access_token`)
  url.searchParams.set('grant_type', 'ig_exchange_token')
  url.searchParams.set('client_secret', process.env.IG_APP_SECRET!)
  url.searchParams.set('access_token', shortLivedToken)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Instagram long-lived exchange failed: ${res.status} ${await res.text()}`)
  return res.json() as Promise<{ access_token: string; expires_in: number }>
}

export async function refreshLongLivedToken(token: string) {
  const url = new URL(`${GRAPH_BASE}/refresh_access_token`)
  url.searchParams.set('grant_type', 'ig_refresh_token')
  url.searchParams.set('access_token', token)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Instagram token refresh failed: ${res.status} ${await res.text()}`)
  return res.json() as Promise<{ access_token: string; expires_in: number }>
}

export async function getMyIgUserId(token: string): Promise<string> {
  const me = await igGet('/me', token, { fields: 'id' })
  return me.id
}

export async function igGet(path: string, token: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(`${GRAPH_BASE}${path}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  url.searchParams.set('access_token', token)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Instagram API GET ${path} failed: ${res.status} ${await res.text()}`)
  return res.json()
}

export async function igPost(path: string, token: string, params: Record<string, string>): Promise<any> {
  const url = new URL(`${GRAPH_BASE}${path}`)
  const body = new URLSearchParams({ ...params, access_token: token })
  const res = await fetch(url, { method: 'POST', body })
  if (!res.ok) throw new Error(`Instagram API POST ${path} failed: ${res.status} ${await res.text()}`)
  return res.json()
}

export function colorForId(id: string): string {
  const palette = ['#7c3aed', '#0f766e', '#b45309', '#be123c']
  const n = [...id].reduce((s, c) => s + c.charCodeAt(0), 0)
  return palette[n % palette.length]
}
