import { TrendingUp, Users, Image as ImageIcon, Lightbulb, ExternalLink, CircleAlert, CircleCheck } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { accounts as staticAccounts, recommendations, lastUpdated, type CompetitorAccount } from '../data'
import { useApi } from '../hooks/useApi'

const fmt = (n: number) => n.toLocaleString('es-ES')

interface LiveAccount {
  handle: string
  name: string
  followers: number
  posts: number | null
  followersPerPost: number | null
}

export function CompetitionPage() {
  const { data: live } = useApi<LiveAccount | null>('/api/instagram/account')

  const accounts = staticAccounts.map(a =>
    a.isUs && live
      ? { ...a, followers: live.followers, posts: live.posts ?? a.posts, followersPerPost: live.followersPerPost ?? a.followersPerPost }
      : a,
  )

  const chartData = accounts
    .filter(a => a.followersPerPost != null)
    .map(a => ({
      name: a.handle.replace('@', ''),
      ratio: a.followersPerPost as number,
      isUs: a.isUs,
    }))
    .sort((a, b) => b.ratio - a.ratio)

  const us = accounts.find(a => a.isUs)!
  const best = [...accounts].filter(a => a.comparable && !a.isUs).sort((a, b) => b.followers - a.followers)[0]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Competencia alrededor de Simone & Son</h1>
        <p className="mt-1 text-sm text-slate-500">
          Benchmark público de cuentas de joyería en Orange County/California. Última actualización: {lastUpdated}.
        </p>
      </div>

      {/* Data caveat */}
      {live ? (
        <div className="mb-8 flex items-start gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Tus propios números ({us.handle}) ya vienen en vivo desde Instagram. Los de la competencia siguen siendo de
            fuentes públicas — Instagram bloquea el scraping y su API solo da acceso a la cuenta conectada.
          </p>
        </div>
      ) : (
        <div className="mb-8 flex items-start gap-2.5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Instagram bloquea el scraping público, así que estos números son a nivel de perfil (seguidores, posts) sacados de
            fuentes públicas — no hay alcance ni impresiones reales. Conecta tu cuenta (arriba a la derecha) para que al
            menos tus propios números vengan en vivo.
          </p>
        </div>
      )}

      {/* Hero stats */}
      <section className="mb-10 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label={`${us.handle} — seguidores`}
          value={fmt(us.followers)}
          sub="Tu cuenta"
          highlight
        />
        <StatCard
          icon={<ImageIcon className="h-4 w-4" />}
          label={`${us.handle} — posts`}
          value={fmt(us.posts ?? 0)}
          sub={`${us.followersPerPost} seguidores por post`}
          highlight
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Mejor competidor directo"
          value={best.handle}
          sub={`${fmt(best.followers)} seguidores`}
        />
      </section>

      {/* Chart */}
      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-800">Seguidores por post</h2>
        <p className="mb-4 text-xs text-slate-500">
          Cuántos seguidores gana cada cuenta, en promedio, por cada publicación — una medida de qué tan bien conecta el
          formato, no solo el volumen.
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: '#334155' }}
                tickLine={false}
                axisLine={false}
                width={140}
              />
              <Tooltip
                formatter={v => [`${v} seguidores/post`, '']}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Bar dataKey="ratio" radius={[0, 6, 6, 0]} barSize={22}>
                {chartData.map(d => (
                  <Cell key={d.name} fill={d.isUs ? '#7c3aed' : '#c4b5fd'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Competitor cards */}
      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">Cuentas analizadas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map(a => (
            <AccountCard key={a.handle} account={a} />
          ))}
        </div>
      </section>

      {/* Recommendations */}
      <section className="rounded-2xl border border-violet-100 bg-violet-50/50 p-5">
        <div className="mb-3 flex items-center gap-2 text-violet-700">
          <Lightbulb className="h-4 w-4" />
          <h2 className="text-sm font-semibold">Recomendaciones para el equipo de marketing</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {recommendations.map(r => (
            <div key={r.title} className="rounded-xl border border-white bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-800">{r.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{r.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({
  icon, label, value, sub, highlight,
}: { icon: React.ReactNode; label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight ? 'border-violet-200 bg-violet-50/60' : 'border-slate-200 bg-white'
      }`}
    >
      <div className={`mb-2 flex items-center gap-1.5 text-xs font-medium ${highlight ? 'text-violet-600' : 'text-slate-400'}`}>
        {icon}
        {label}
      </div>
      <p className="text-2xl font-bold tabular-nums text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
    </div>
  )
}

function AccountCard({ account: a }: { account: CompetitorAccount }) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border bg-white p-4 ${
        a.isUs ? 'border-violet-300 ring-1 ring-violet-200' : 'border-slate-200'
      } ${!a.comparable ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-slate-900">{a.handle}</p>
            {a.isUs && (
              <span className="rounded-full bg-violet-600 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">Nosotros</span>
            )}
          </div>
          <p className="text-xs text-slate-500">{a.name}</p>
        </div>
        <a
          href={`https://www.instagram.com/${a.handle.replace('@', '')}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-300 hover:text-violet-500"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span className="tabular-nums text-slate-700">
          <b className="font-semibold">{fmt(a.followers)}</b> seguidores
        </span>
        {a.posts != null && (
          <span className="tabular-nums text-slate-700">
            <b className="font-semibold">{fmt(a.posts)}</b> posts
          </span>
        )}
        {a.followersPerPost != null && (
          <span className="tabular-nums text-violet-600">
            <b className="font-semibold">{a.followersPerPost}</b> seg./post
          </span>
        )}
      </div>

      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{a.location}</p>
      <p className="text-xs text-slate-600">{a.format}</p>
      <p className="border-t border-slate-100 pt-2 text-xs leading-relaxed text-slate-500">{a.note}</p>
      {!a.comparable && (
        <p className="text-[10px] font-medium uppercase tracking-wide text-amber-600">No comparable directamente</p>
      )}
    </div>
  )
}
