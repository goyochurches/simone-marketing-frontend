import { Plus, Trash2, Sparkles } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  defaultPersonality,
  buildSystemPrompt,
  type PersonalityConfig,
  type FewShotExample,
  type Formality,
  type EmojiUsage,
} from '../personality'

const FORMALITY_OPTIONS: Formality[] = ['muy cercano', 'cercano', 'neutral', 'formal']
const EMOJI_OPTIONS: EmojiUsage[] = ['ninguno', 'poco', 'normal', 'bastante']

export function PersonalityPage() {
  const [personality, setPersonality] = useLocalStorage<PersonalityConfig>('personality-config', defaultPersonality)

  function update<K extends keyof PersonalityConfig>(key: K, value: PersonalityConfig[K]) {
    setPersonality(prev => ({ ...prev, [key]: value }))
  }

  function addExample() {
    const ex: FewShotExample = { id: crypto.randomUUID(), question: '', answer: '' }
    update('examples', [...personality.examples, ex])
  }

  function updateExample(id: string, field: 'question' | 'answer', value: string) {
    update(
      'examples',
      personality.examples.map(e => (e.id === id ? { ...e, [field]: value } : e)),
    )
  }

  function removeExample(id: string) {
    update('examples', personality.examples.filter(e => e.id !== id))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Tu personalidad</h1>
        <p className="mt-1 text-sm text-slate-500">
          Esto define cómo suena la IA cuando responde por ti. Se guarda en este navegador y se usa para generar las
          respuestas en la bandeja de DMs.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Form */}
        <div className="flex flex-col gap-5">
          <Field label="Cómo eres, en tus palabras">
            <textarea
              value={personality.description}
              onChange={e => update('description', e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="Cercana, directa, explico el porqué de un precio en vez de solo darlo…"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Formalidad">
              <select
                value={personality.formality}
                onChange={e => update('formality', e.target.value as Formality)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                {FORMALITY_OPTIONS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </Field>
            <Field label="Uso de emojis">
              <select
                value={personality.emojiUsage}
                onChange={e => update('emojiUsage', e.target.value as EmojiUsage)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                {EMOJI_OPTIONS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Idioma">
              <input
                value={personality.language}
                onChange={e => update('language', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </Field>
            <Field label="Firma">
              <input
                value={personality.signature}
                onChange={e => update('signature', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </Field>
          </div>

          <Field label="Nunca digas / hagas esto">
            <textarea
              value={personality.neverSay}
              onChange={e => update('neverSay', e.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </Field>

          {/* Few-shot examples */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ejemplos reales de cómo respondes
              </label>
              <button
                onClick={addExample}
                className="flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100"
              >
                <Plus className="h-3 w-3" /> Añadir ejemplo
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {personality.examples.map(ex => (
                <div key={ex.id} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Ejemplo</span>
                    <button onClick={() => removeExample(ex.id)} className="text-slate-300 hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    value={ex.question}
                    onChange={e => updateExample(ex.id, 'question', e.target.value)}
                    placeholder="Pregunta del cliente…"
                    className="mb-2 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                  <textarea
                    value={ex.answer}
                    onChange={e => updateExample(ex.id, 'answer', e.target.value)}
                    placeholder="Tu respuesta real…"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </div>
              ))}
              {personality.examples.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                  Sin ejemplos todavía — con 2 o 3 reales, la IA imita tu estilo mucho mejor.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Live prompt preview */}
        <div className="h-fit rounded-2xl border border-slate-200 bg-slate-900 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            Así se lo diremos a la IA
          </div>
          <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-300">
            {buildSystemPrompt(personality)}
          </pre>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  )
}
