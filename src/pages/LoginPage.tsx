import { useState } from 'react'
import type { FormEvent } from 'react'
import { AtSign, Lock } from 'lucide-react'

export function LoginPage({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error ?? 'No se pudo iniciar sesión')
      }
      onSuccess()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="mb-2 flex items-center gap-2 text-violet-600">
          <AtSign className="h-4 w-4" />
          <span className="text-sm font-bold text-slate-900">Simone & Son</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">— Marketing</span>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Usuario</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            required
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
        >
          <Lock className="h-3.5 w-3.5" />
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
