import { useState } from 'react'
import { Sparkles, Copy, Check, Lock, CircleAlert, Loader2, Gem } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useDraftReplies, type DraftState } from '../hooks/useDraftReplies'
import { defaultPersonality, buildSystemPrompt, type PersonalityConfig } from '../personality'
import { mockPendingDms } from '../dms'
import { mockPendingComments } from '../comments'

export function DmInboxPage() {
  const [personality] = useLocalStorage<PersonalityConfig>('personality-config', defaultPersonality)
  const [apiKey, setApiKey] = useState('')

  const systemPrompt = buildSystemPrompt(personality)
  const dmDrafts = useDraftReplies(systemPrompt)
  const commentDrafts = useDraftReplies(systemPrompt)

  const dmItems = mockPendingDms.map(dm => ({ id: dm.id, prompt: dm.message }))
  const commentItems = mockPendingComments.map(c => ({
    id: c.id,
    prompt: `[Publicación: "${c.post.productName}" — descripción: "${c.post.caption}"]\nComentario: ${c.comment}`,
  }))

  async function generateEverything() {
    if (!apiKey) return
    await Promise.all([
      dmDrafts.generateAll(apiKey, dmItems),
      commentDrafts.generateAll(apiKey, commentItems),
    ])
  }

  const totalPending = mockPendingDms.length + mockPendingComments.length

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mensajes pendientes</h1>
          <p className="mt-1 text-sm text-slate-500">
            {totalPending} sin responder — {mockPendingComments.length} comentarios en publicaciones y {mockPendingDms.length} DMs.
          </p>
        </div>
        <button
          onClick={generateEverything}
          disabled={!apiKey || dmDrafts.bulkRunning || commentDrafts.bulkRunning}
          className="flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {(dmDrafts.bulkRunning || commentDrafts.bulkRunning) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generar todas las respuestas
        </button>
      </div>

      <div className="mb-6">
        <Caveat>
          Estos mensajes y comentarios son de ejemplo — todavía no está conectada la cuenta de Instagram (falta el setup de
          Meta que dejamos pendiente), así que "Enviar a Instagram" queda deshabilitado hasta entonces.
        </Caveat>
      </div>

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

      {/* Comments — need post context to make sense */}
      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">Comentarios en publicaciones</h2>
        <div className="flex flex-col gap-4">
          {mockPendingComments.map(c => (
            <div key={c.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <PostThumbnail productName={c.post.productName} color={c.post.color} />
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">{c.post.productName}</p>
                <p className="mb-3 line-clamp-2 text-xs italic text-slate-400">"{c.post.caption}"</p>

                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{c.from} <span className="font-normal text-slate-400">{c.handle}</span></p>
                    <p className="text-[11px] text-slate-400">{new Date(c.receivedAt).toLocaleString('es-ES')}</p>
                  </div>
                  <GenerateButton
                    apiKey={apiKey}
                    draft={commentDrafts.drafts[c.id]}
                    onClick={() => commentDrafts.generateOne(apiKey, { id: c.id, prompt: commentItems.find(i => i.id === c.id)!.prompt })}
                  />
                </div>

                <p className="mb-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{c.comment}</p>

                <DraftEditor
                  id={c.id}
                  draft={commentDrafts.drafts[c.id]}
                  onEdit={commentDrafts.editDraft}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DMs */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-800">DMs directos</h2>
        <div className="flex flex-col gap-4">
          {mockPendingDms.map(dm => (
            <div key={dm.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{dm.from} <span className="font-normal text-slate-400">{dm.handle}</span></p>
                  <p className="text-[11px] text-slate-400">{new Date(dm.receivedAt).toLocaleString('es-ES')}</p>
                </div>
                <GenerateButton
                  apiKey={apiKey}
                  draft={dmDrafts.drafts[dm.id]}
                  onClick={() => dmDrafts.generateOne(apiKey, { id: dm.id, prompt: dm.message })}
                />
              </div>

              <p className="mb-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{dm.message}</p>

              <DraftEditor id={dm.id} draft={dmDrafts.drafts[dm.id]} onEdit={dmDrafts.editDraft} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function PostThumbnail({ productName, color }: { productName: string; color: string }) {
  return (
    <div
      className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl text-white"
      style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
      title={`Foto real pendiente de conectar — ${productName}`}
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
  id, draft, onEdit,
}: { id: string; draft: DraftState | undefined; onEdit: (id: string, text: string) => void }) {
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
      <div className="flex justify-end gap-2">
        <button
          onClick={copy}
          disabled={!draft.text}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
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
