import { lazy, Suspense, useState } from 'react'
import { AtSign, TrendingUp, UserCog, MessageCircle, Send, CircleDot, PlugZap, LogOut, Unplug, Image, BarChart3 } from 'lucide-react'
import { LoginPage } from './pages/LoginPage'
import { useInstagramStatus } from './hooks/useInstagramStatus'
import { useAuthSession } from './hooks/useAuthSession'

const CompetitionPage = lazy(() => import('./pages/CompetitionPage').then(m => ({ default: m.CompetitionPage })))
const PersonalityPage = lazy(() => import('./pages/PersonalityPage').then(m => ({ default: m.PersonalityPage })))
const CommentsPage = lazy(() => import('./pages/CommentsPage').then(m => ({ default: m.CommentsPage })))
const DmChatPage = lazy(() => import('./pages/DmChatPage').then(m => ({ default: m.DmChatPage })))
const PhotoEditorPage = lazy(() => import('./pages/PhotoEditorPage').then(m => ({ default: m.PhotoEditorPage })))
const PerformancePage = lazy(() => import('./pages/PerformancePage').then(m => ({ default: m.PerformancePage })))

const TABS = [
  { id: 'performance', label: 'Rendimiento', icon: BarChart3 },
  { id: 'competition', label: 'Competencia', icon: TrendingUp },
  { id: 'personality', label: 'Personalidad', icon: UserCog },
  { id: 'comments', label: 'Comentarios', icon: MessageCircle },
  { id: 'dms', label: 'DMs', icon: Send },
  { id: 'editor', label: 'Editor de fotos', icon: Image },
] as const

type TabId = (typeof TABS)[number]['id']

function App() {
  const { data: session, loading, refetch } = useAuthSession()

  if (loading) return null
  if (!session?.authenticated) return <LoginPage onSuccess={refetch} />
  return <Dashboard onLogout={refetch} />
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<TabId>('performance')
  const { data: status, refetch: refetchStatus } = useInstagramStatus()

  async function handleLogout() {
    await fetch('/api/auth/session', { method: 'DELETE' })
    onLogout()
  }

  async function handleDisconnectInstagram() {
    await fetch('/api/instagram/status', { method: 'DELETE' })
    refetchStatus()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2 text-violet-600">
            <AtSign className="h-4 w-4" />
            <span className="text-sm font-bold text-slate-900">Simone & Son</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">— Marketing</span>
          </div>
          <nav className="flex gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
            {TABS.map(t => {
              const Icon = t.icon
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    active ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              )
            })}
          </nav>
          <div className="flex items-center gap-2">
            <InstagramConnectionBadge connected={status?.connected ?? false} onDisconnect={handleDisconnectInstagram} />
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Suspense fallback={null}>
          {tab === 'performance' && <PerformancePage />}
          {tab === 'competition' && <CompetitionPage />}
          {tab === 'personality' && <PersonalityPage />}
          {tab === 'comments' && <CommentsPage />}
          {tab === 'dms' && <DmChatPage />}
          {tab === 'editor' && <PhotoEditorPage />}
        </Suspense>
      </main>
    </div>
  )
}

function InstagramConnectionBadge({ connected, onDisconnect }: { connected: boolean; onDisconnect: () => void }) {
  if (connected) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
          <CircleDot className="h-3 w-3" />
          Instagram conectado
        </span>
        <button
          onClick={onDisconnect}
          title="Desconectar Instagram"
          className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700"
        >
          <Unplug className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <a
      href="/api/auth/instagram/login"
      className="flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700"
    >
      <PlugZap className="h-3.5 w-3.5" />
      Conectar Instagram
    </a>
  )
}

export default App
