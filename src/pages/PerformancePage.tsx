import { useState } from 'react'
import { BarChart3, Heart, MessageCircle, Sparkles, Loader2, TrendingUp, TrendingDown, CircleAlert } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useApi } from '../hooks/useApi'
import { generateReply } from '../lib/groq'
import type { InsightsSummary, PostInsight } from '../insights'

const fmt = (n: number) => n.toLocaleString('es-ES')

const FORMAT_LABELS: Record<string, string> = {
  FEED: 'Fotos/carruseles',
  REELS: 'Reels',
  CAROUSEL_ALBUM: 'Carruseles',
  IMAGE: 'Fotos',
  VIDEO: 'Videos',
}

export function PerformancePage() {
  const { data, loading } = useApi<InsightsSummary>('/api/instagram/insights')
  const [apiKey, setApiKey] = useState('')
  const [tips, setTips] = useState<{ status: 'idle' | 'loading' | 'ready' | 'error'; text?: string; error?: string }>({
    status: 'idle',
  })

  const posts = data?.posts ?? []
  const sorted = [...posts].sort((a, b) => b.engagement - a.engagement)
  const top = sorted.slice(0, 5)
  const bottom = sorted.slice(-5).reverse()

  const chartData = (data?.byFormat ?? []).map(f => ({
    name: FORMAT_LABELS[f.type] ?? f.type,
    value: f.avgEngagement,
    count: f.count,
  }))

  async function generateTips() {
    if (!apiKey || posts.length === 0) return
    setTips({ status: 'loading' })
    try {
      const summary = buildStrategyPrompt(data!, top, bottom)
      const systemPrompt =
        'Eres un estratega de contenido de Instagram. Te doy datos reales de rendimiento de las publicaciones de una persona (likes + comentarios como medida de interacción, no hay alcance ni impresiones disponibles). ' +
        'Da 4-6 consejos concretos y accionables en español para mejorar sus próximas publicaciones, basados en los patrones que veas (qué formatos, temas o estilos de caption le funcionan mejor o peor). Sé específico, no genérico. Responde solo con la lista de consejos.'
      const text = await generateReply(apiKey, systemPrompt, summary)
      setTips({ status: 'ready', text })
    } catch (e) {
      setTips({ status: 'error', error: (e as Error).message })
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Rendimiento de tus posts</h1>
        <p className="mt-1 text-sm text-slate-500">
          Basado en tus publicaciones reales (likes + comentarios). Instagram no da acceso por API a alcance,
          impresiones ni historias — solo a tus posts y reels permanentes.
        </p>
      </div>

      {!loading && posts.length === 0 && (
        <div className="mb-8 flex items-start gap-2.5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>No hay publicaciones para analizar todavía — conecta tu cuenta de Instagram arriba a la derecha.</p>
        </div>
      )}

      {posts.length > 0 && (
        <>
          <section className="mb-10 grid gap-4 sm:grid-cols-3">
            <StatCard icon={<BarChart3 className="h-4 w-4" />} label="Engagement promedio" value={fmt(data!.avgEngagement)} sub="Likes + comentarios por post" />
            <StatCard icon={<Heart className="h-4 w-4" />} label="Likes promedio" value={fmt(data!.avgLikes)} sub="Por publicación" />
            <StatCard icon={<MessageCircle className="h-4 w-4" />} label="Comentarios promedio" value={fmt(data!.avgComments)} sub="Por publicación" />
          </section>

          <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">Engagement promedio por formato</h2>
            <p className="mb-4 text-xs text-slate-500">Cuál tipo de publicación te funciona mejor en promedio.</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#334155' }} tickLine={false} axisLine={false} width={120} />
                  <Tooltip
                    formatter={(v, _n, item) => [`${v} engagement (${item.payload.count} posts)`, '']}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                    {chartData.map(d => <Cell key={d.name} fill="#7c3aed" />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="mb-10 grid gap-6 lg:grid-cols-2">
            <PostList title="Tus posts con más éxito" icon={<TrendingUp className="h-4 w-4 text-emerald-600" />} items={top} />
            <PostList title="Tus posts con menos éxito" icon={<TrendingDown className="h-4 w-4 text-red-500" />} items={bottom} />
          </section>

          <section className="rounded-2xl border border-violet-100 bg-violet-50/50 p-5">
            <div className="mb-3 flex items-center gap-2 text-violet-700">
              <Sparkles className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Consejos de estrategia con IA</h2>
            </div>

            <label className="mb-3 flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                API key de Groq (solo para probar — no se guarda)
              </span>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="gsk_…"
                className="w-full max-w-sm rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </label>

            <button
              onClick={generateTips}
              disabled={!apiKey || tips.status === 'loading'}
              className="flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {tips.status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generar consejos
            </button>

            {tips.status === 'error' && (
              <p className="mt-3 text-sm text-red-600">No se pudo generar: {tips.error}</p>
            )}
            {tips.status === 'ready' && (
              <div className="mt-4 whitespace-pre-wrap rounded-xl bg-white p-4 text-sm leading-relaxed text-slate-700">
                {tips.text}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function buildStrategyPrompt(data: InsightsSummary, top: PostInsight[], bottom: PostInsight[]): string {
  const fmtPost = (p: PostInsight) =>
    `- [${FORMAT_LABELS[p.productType] ?? p.productType}] ${p.likeCount} likes, ${p.commentsCount} comentarios — caption: "${p.caption.slice(0, 120)}"`

  return [
    `Engagement promedio general: ${data.avgEngagement} (${data.avgLikes} likes + ${data.avgComments} comentarios en promedio).`,
    '',
    'Por formato:',
    ...data.byFormat.map(f => `- ${FORMAT_LABELS[f.type] ?? f.type}: ${f.avgEngagement} engagement promedio (${f.count} posts)`),
    '',
    'Sus 5 posts con MÁS éxito:',
    ...top.map(fmtPost),
    '',
    'Sus 5 posts con MENOS éxito:',
    ...bottom.map(fmtPost),
  ].join('\n')
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-violet-600">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-bold tabular-nums text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
    </div>
  )
}

function PostList({ title, icon, items }: { title: string; icon: React.ReactNode; items: PostInsight[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="flex flex-col gap-3">
        {items.map(p => (
          <a
            key={p.id}
            href={p.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 rounded-xl border border-slate-100 p-2 hover:border-violet-200 hover:bg-violet-50/40"
          >
            {p.thumbnailUrl ? (
              <img src={p.thumbnailUrl} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="h-14 w-14 shrink-0 rounded-lg bg-slate-100" />
            )}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-xs text-slate-600">{p.caption || <em className="text-slate-400">Sin descripción</em>}</p>
              <p className="mt-1 text-[11px] font-medium text-violet-600">
                {fmt(p.likeCount)} likes · {fmt(p.commentsCount)} comentarios
              </p>
            </div>
          </a>
        ))}
        {items.length === 0 && <p className="text-xs text-slate-400">Sin datos suficientes.</p>}
      </div>
    </div>
  )
}
