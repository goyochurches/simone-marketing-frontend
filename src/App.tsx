import { useState } from 'react'
import { AtSign, TrendingUp, UserCog, Inbox } from 'lucide-react'
import { CompetitionPage } from './pages/CompetitionPage'
import { PersonalityPage } from './pages/PersonalityPage'
import { DmInboxPage } from './pages/DmInboxPage'

const TABS = [
  { id: 'competition', label: 'Competencia', icon: TrendingUp },
  { id: 'personality', label: 'Personalidad', icon: UserCog },
  { id: 'dms', label: 'DMs pendientes', icon: Inbox },
] as const

type TabId = (typeof TABS)[number]['id']

function App() {
  const [tab, setTab] = useState<TabId>('competition')

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
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {tab === 'competition' && <CompetitionPage />}
        {tab === 'personality' && <PersonalityPage />}
        {tab === 'dms' && <DmInboxPage />}
      </main>
    </div>
  )
}

export default App
