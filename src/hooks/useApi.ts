import { useCallback, useEffect, useState } from 'react'

export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch(path)
      .then(res => {
        if (!res.ok) throw new Error(`${path} → ${res.status}`)
        return res.json()
      })
      .then((json: T) => setData(json))
      .catch(e => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [path])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}

export async function postJson(path: string, body: unknown): Promise<void> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new Error(payload.error ?? `${path} → ${res.status}`)
  }
}

export async function deleteJson(path: string): Promise<void> {
  const res = await fetch(path, { method: 'DELETE' })
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new Error(payload.error ?? `${path} → ${res.status}`)
  }
}
