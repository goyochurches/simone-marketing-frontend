import { useState } from 'react'
import { Sparkles, Copy, Check, Lock, Loader2 } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useDraftReplies } from '../hooks/useDraftReplies'
import { defaultPersonality, buildSystemPrompt, type PersonalityConfig } from '../personality'
import { mockPendingDms, type PendingDm } from '../dms'

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ['#7c3aed', '#0f766e', '#b45309', '#be123c']
function avatarColor(id: string) {
  const n = [...id].reduce((s, c) => s + c.charCodeAt(0), 0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

export function DmChatPage() {
  const [personality] = useLocalStorage<PersonalityConfig>('personality-config', defaultPersonality)
  const [apiKey, setApiKey] = useState('')
  const [selectedId, setSelectedId] = useState(mockPendingDms[0]?.id)

  const systemPrompt = buildSystemPrompt(personality)
  const { drafts, bulkRunning, generateOne, generateAll, editDraft } = useDraftReplies(systemPrompt)

  const selected = mockPendingDms.find(d => d.id === selectedId)
  const selectedDraft = selected ? drafts[selected.id] : undefined

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Sidebar — conversation list */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-3">
          <p className="px-1 text-sm font-bold text-slate-900">DMs directos</p>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="API key de Groq (gsk_…)"
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <button
            onClick={() => generateAll(apiKey, mockPendingDms.map(d => ({ id: d.id, prompt: d.message })))}
            disabled={!apiKey || bulkRunning}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {bulkRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Generar todas
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {mockPendingDms.map(dm => {
            const active = dm.id === selectedId
            const draftReady = drafts[dm.id]?.status === 'ready'
            return (
              <button
                key={dm.id}
                onClick={() => setSelectedId(dm.id)}
                className={`flex w-full items-center gap-2.5 border-b border-slate-100 px-3 py-3 text-left transition ${
                  active ? 'bg-violet-50' : 'hover:bg-slate-50'
                }`}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: avatarColor(dm.id) }}
                >
                  {initials(dm.from)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate text-xs font-semibold text-slate-800">{dm.from}</p>
                    {draftReady && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />}
                  </div>
                  <p className="truncate text-[11px] text-slate-400">{dm.message}</p>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Chat thread */}
      {selected ? (
        <ChatThread
          key={selected.id}
          dm={selected}
          apiKey={apiKey}
          draft={selectedDraft}
          onGenerate={() => generateOne(apiKey, { id: selected.id, prompt: selected.message })}
          onEdit={text => editDraft(selected.id, text)}
        />
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">Sin conversaciones</div>
      )}
    </div>
  )
}

function ChatThread({
  dm, apiKey, draft, onGenerate, onEdit,
}: {
  dm: PendingDm
  apiKey: string
  draft: ReturnType<typeof useDraftReplies>['drafts'][string] | undefined
  onGenerate: () => void
  onEdit: (text: string) => void
}) {
  const [copied, setCopied] = useState(false)

  function copy() {
    if (!draft?.text) return
    navigator.clipboard.writeText(draft.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-200 px-4 py-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: avatarColor(dm.id) }}
        >
          {initials(dm.from)}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{dm.from}</p>
          <p className="text-[11px] text-slate-400">{dm.handle}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-slate-50 p-4">
        <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm">
          {dm.message}
          <p className="mt-1 text-[10px] text-slate-400">{new Date(dm.receivedAt).toLocaleString('es-ES')}</p>
        </div>

        {draft?.status === 'error' && (
          <p className="max-w-[75%] rounded-2xl rounded-br-sm bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
            No se pudo generar: {draft.error}
          </p>
        )}

        {(draft?.status === 'ready' || draft?.status === 'loading') && (
          <div className="ml-auto flex max-w-[75%] flex-col items-end gap-1.5">
            <textarea
              value={draft.text}
              onChange={e => onEdit(e.target.value)}
              rows={3}
              placeholder={draft.status === 'loading' ? 'Generando…' : ''}
              className="w-full resize-none rounded-2xl rounded-br-sm border border-violet-200 bg-violet-600/95 px-3.5 py-2.5 text-sm text-white placeholder:text-violet-200 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
        )}
      </div>

      {/* Compose bar */}
      <div className="flex items-center gap-2 border-t border-slate-200 p-3">
        <button
          onClick={onGenerate}
          disabled={!apiKey || draft?.status === 'loading'}
          className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {draft?.status === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {draft ? 'Regenerar' : 'Generar respuesta'}
        </button>
        <div className="flex-1" />
        <button
          onClick={copy}
          disabled={!draft?.text}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
        <button
          disabled
          title="Falta conectar la cuenta de Instagram (setup de Meta pendiente)"
          className="flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-2 text-xs font-medium text-slate-400"
        >
          <Lock className="h-3.5 w-3.5" />
          Enviar
        </button>
      </div>
    </div>
  )
}
