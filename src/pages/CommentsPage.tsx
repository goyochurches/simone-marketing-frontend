import { useState } from 'react'
import { Sparkles, Copy, Check, Lock, Send, CircleAlert, Loader2, Gem, EyeOff } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useDraftReplies, type DraftState } from '../hooks/useDraftReplies'
import { useApi, postJson } from '../hooks/useApi'
import { useInstagramStatus } from '../hooks/useInstagramStatus'
import { defaultPersonality, buildSystemPrompt, type PersonalityConfig } from '../personality'
import type { PendingComment } from '../comments'

export function CommentsPage() {
  const [personality] = useLocalStorage<PersonalityConfig>('personality-config', defaultPersonality)
  const [apiKey, setApiKey] = useState('')
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [sendError, setSendError] = useState<{ id: string; message: string } | null>(null)
  const [dismissingId, setDismissingId] = useState<string | null>(null)

  const { data: status } = useInstagramStatus()
  const connected = status?.connected ?? false
  const { data: comments, loading, refetch } = useApi<PendingComment[]>('/api/instagram/comments')
  const pendingComments = comments ?? []

  const systemPrompt = buildSystemPrompt(personality)
  const { drafts, bulkRunning, generateOne, generateAll, editDraft } = useDraftReplies(systemPrompt)

  const commentItems = pendingComments.map(c => ({
    id: c.id,
    prompt: `[Publicación: "${c.post.productName}" — descripción: "${c.post.caption}"]\nComentario: ${c.comment}`,
  }))

  async function sendReply(id: string, text: string) {
    setSendingId(id)
    setSendError(null)
    try {
      await postJson(`/api/instagram/comments/${id}/reply`, { text })
      refetch()
    } catch (e) {
      setSendError({ id, message: (e as Error).message })
    } finally {
      setSendingId(null)
    }
  }

  async function dismiss(id: string) {
    setDismissingId(id)
    try {
      await postJson(`/api/instagram/comments/${id}/dismiss`, {})
      refetch()
    } finally {
      setDismissingId(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Comentarios en publicaciones</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? 'Cargando…' : `${pendingComments.length} comentarios sin responder.`}
          </p>
        </div>
        <button
          onClick={() => generateAll(apiKey, commentItems)}
          disabled={!apiKey || bulkRunning || pendingComments.length === 0}
          className="flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {bulkRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generar todas las respuestas
        </button>
      </div>

      {!connected && (
        <div className="mb-6">
          <Caveat>
            Todavía no está conectada la cuenta de Instagram — usa el botón "Conectar Instagram" arriba a la derecha.
            Mientras tanto no hay comentarios reales que mostrar.
          </Caveat>
        </div>
      )}

      {/* API key input */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            API key de Groq (solo para probar — no se guarda)
          </span>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="gsk_…"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </label>
        <p className="mt-1.5 text-[11px] text-slate-400">
          Se usa solo en tu navegador para llamar a la API de Groq directamente; se pierde al recargar la página.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {pendingComments.map(c => (
          <div key={c.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
            <PostThumbnail productName={c.post.productName} color={c.post.color} mediaUrl={c.post.mediaUrl} />
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">{c.post.productName}</p>
              <p className="mb-3 line-clamp-2 text-xs italic text-slate-400">"{c.post.caption}"</p>

              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{c.from} <span className="font-normal text-slate-400">{c.handle}</span></p>
                  <p className="text-[11px] text-slate-400">{new Date(c.receivedAt).toLocaleString('es-ES')}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <GenerateButton
                    apiKey={apiKey}
                    draft={drafts[c.id]}
                    onClick={() => generateOne(apiKey, { id: c.id, prompt: commentItems.find(i => i.id === c.id)!.prompt })}
                  />
                  <button
                    onClick={() => dismiss(c.id)}
                    disabled={dismissingId === c.id}
                    title="Ocultar de tu bandeja (no lo borra de Instagram)"
                    className="flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                  >
                    {dismissingId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <p className="mb-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{c.comment}</p>

              <DraftEditor
                id={c.id}
                draft={drafts[c.id]}
                onEdit={editDraft}
                connected={connected}
                sending={sendingId === c.id}
                sendErrorMessage={sendError?.id === c.id ? sendError.message : undefined}
                onSend={text => sendReply(c.id, text)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PostThumbnail({ productName, color, mediaUrl }: { productName: string; color: string; mediaUrl?: string }) {
  if (mediaUrl) {
    return (
      <img
        src={mediaUrl}
        alt={productName}
        title={productName}
        className="h-20 w-20 shrink-0 rounded-xl object-cover"
      />
    )
  }
  return (
    <div
      className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl text-white"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
      title={productName}
    >
      <Gem className="h-5 w-5 opacity-90" />
    </div>
  )
}

function GenerateButton({ apiKey, draft, onClick }: { apiKey: string; draft: DraftState | undefined; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={!apiKey || draft?.status === 'loading'}
      className="flex shrink-0 items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {draft?.status === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
      {draft ? 'Regenerar' : 'Generar respuesta'}
    </button>
  )
}

function DraftEditor({
  id, draft, onEdit, connected, sending, sendErrorMessage, onSend,
}: {
  id: string
  draft: DraftState | undefined
  onEdit: (id: string, text: string) => void
  connected: boolean
  sending: boolean
  sendErrorMessage: string | undefined
  onSend: (text: string) => void
}) {
  const [copied, setCopied] = useState(false)

  function copy() {
    if (!draft?.text) return
    navigator.clipboard.writeText(draft.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (draft?.status === 'error') {
    return <Caveat tone="error">No se pudo generar: {draft.error}</Caveat>
  }

  if (draft?.status !== 'ready' && draft?.status !== 'loading') return null

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={draft.text}
        onChange={e => onEdit(id, e.target.value)}
        rows={3}
        placeholder={draft.status === 'loading' ? 'Generando…' : ''}
        className="w-full resize-none rounded-xl border border-violet-200 bg-violet-50/40 p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
      />
      {sendErrorMessage && <Caveat tone="error">No se pudo enviar: {sendErrorMessage}</Caveat>}
      <div className="flex justify-end gap-2">
        <button
          onClick={copy}
          disabled={!draft.text}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
        {connected ? (
          <button
            onClick={() => onSend(draft.text)}
            disabled={!draft.text || sending}
            className="flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Enviar a Instagram
          </button>
        ) : (
          <button
            disabled
            title="Falta conectar la cuenta de Instagram"
            className="flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-400"
          >
            <Lock className="h-3.5 w-3.5" />
            Enviar a Instagram
          </button>
        )}
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
