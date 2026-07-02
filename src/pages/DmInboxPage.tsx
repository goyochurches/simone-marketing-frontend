import { useState } from 'react'
import { Sparkles, Copy, Check, Lock, CircleAlert, Loader2 } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { defaultPersonality, buildSystemPrompt, type PersonalityConfig } from '../personality'
import { mockPendingDms } from '../dms'
import { generateReply } from '../lib/anthropic'

type DraftState = {
  text: string
  status: 'idle' | 'loading' | 'ready' | 'error'
  error?: string
}

export function DmInboxPage() {
  const [personality] = useLocalStorage<PersonalityConfig>('personality-config', defaultPersonality)
  const [apiKey, setApiKey] = useState('')
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [bulkRunning, setBulkRunning] = useState(false)

  const systemPrompt = buildSystemPrompt(personality)

  async function generateOne(id: string, message: string) {
    if (!apiKey) return
    setDrafts(prev => ({ ...prev, [id]: { text: '', status: 'loading' } }))
    try {
      const text = await generateReply(apiKey, systemPrompt, message)
      setDrafts(prev => ({ ...prev, [id]: { text, status: 'ready' } }))
    } catch (e) {
      setDrafts(prev => ({ ...prev, [id]: { text: '', status: 'error', error: (e as Error).message } }))
    }
  }

  async function generateAll() {
    if (!apiKey || bulkRunning) return
    setBulkRunning(true)
    for (const dm of mockPendingDms) {
      await generateOne(dm.id, dm.message)
    }
    setBulkRunning(false)
  }

  function editDraft(id: string, text: string) {
    setDrafts(prev => ({ ...prev, [id]: { ...(prev[id] ?? { status: 'ready' }), text, status: 'ready' } }))
  }

  function copyDraft(id: string, text: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const pendingCount = mockPendingDms.length

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">DMs sin responder</h1>
          <p className="mt-1 text-sm text-slate-500">
            {pendingCount} mensajes pendientes. Genera todas las respuestas de una vez con tu personalidad configurada.
          </p>
        </div>
        <button
          onClick={generateAll}
          disabled={!apiKey || bulkRunning}
          className="flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {bulkRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generar todas las respuestas
        </button>
      </div>

      {/* Mock data + Instagram connection caveats */}
      <div className="mb-6 flex flex-col gap-2">
        <Caveat>
          Estos DMs son de ejemplo — todavía no está conectada la cuenta de Instagram (falta el setup de Meta que dejamos
          pendiente), así que "Enviar a Instagram" queda deshabilitado hasta entonces.
        </Caveat>
      </div>

      {/* API key input */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            API key de Anthropic (solo para probar — no se guarda)
          </span>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-ant-…"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </label>
        <p className="mt-1.5 text-[11px] text-slate-400">
          Se usa solo en tu navegador para llamar a la API de Anthropic directamente; se pierde al recargar la página.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {mockPendingDms.map(dm => {
          const draft = drafts[dm.id]
          return (
            <div key={dm.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{dm.from} <span className="font-normal text-slate-400">{dm.handle}</span></p>
                  <p className="text-[11px] text-slate-400">{new Date(dm.receivedAt).toLocaleString('es-ES')}</p>
                </div>
                <button
                  onClick={() => generateOne(dm.id, dm.message)}
                  disabled={!apiKey || draft?.status === 'loading'}
                  className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {draft?.status === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {draft ? 'Regenerar' : 'Generar respuesta'}
                </button>
              </div>

              <p className="mb-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{dm.message}</p>

              {draft?.status === 'error' && (
                <Caveat tone="error">No se pudo generar: {draft.error}</Caveat>
              )}

              {(draft?.status === 'ready' || draft?.status === 'loading') && (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={draft.text}
                    onChange={e => editDraft(dm.id, e.target.value)}
                    rows={3}
                    placeholder={draft.status === 'loading' ? 'Generando…' : ''}
                    className="w-full resize-none rounded-xl border border-violet-200 bg-violet-50/40 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => copyDraft(dm.id, draft.text)}
                      disabled={!draft.text}
                      className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      {copiedId === dm.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedId === dm.id ? 'Copiado' : 'Copiar'}
                    </button>
                    <button
                      disabled
                      title="Falta conectar la cuenta de Instagram (setup de Meta pendiente)"
                      className="flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-400"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      Enviar a Instagram
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Caveat({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'error' }) {
  const cls = tone === 'error'
    ? 'border-red-100 bg-red-50 text-red-700'
    : 'border-amber-100 bg-amber-50 text-amber-800'
  return (
    <div className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm ${cls}`}>
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </div>
  )
}
