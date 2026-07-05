import { neon } from '@neondatabase/serverless'

/** Minimal drop-in replacement for the subset of the @upstash/redis client API this project uses, backed by Postgres instead. */
interface KvClient {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: unknown): Promise<void>
  del(key: string): Promise<void>
}

let client: KvClient | null = null

export function kv(): KvClient {
  if (!client) {
    const sql = neon(process.env.DATABASE_URL!)
    client = {
      async get<T>(key: string): Promise<T | null> {
        const rows = await sql`SELECT value FROM app.kv_store WHERE key = ${key}`
        return (rows[0]?.value as T) ?? null
      },
      async set(key: string, value: unknown): Promise<void> {
        await sql`
          INSERT INTO app.kv_store (key, value, updated_at)
          VALUES (${key}, ${JSON.stringify(value)}::jsonb, now())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
        `
      },
      async del(key: string): Promise<void> {
        await sql`DELETE FROM app.kv_store WHERE key = ${key}`
      },
    }
  }
  return client
}
