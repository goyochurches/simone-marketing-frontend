import { ELEMENTS } from '../../lib/photo-editor/elements'

interface ElementsPanelProps {
  onAdd: (iconId: string) => void
}

export function ElementsPanel({ onAdd }: ElementsPanelProps) {
  return (
    <div className="grid max-h-80 w-72 grid-cols-4 gap-2 overflow-y-auto p-1">
      {ELEMENTS.map(el => (
        <button
          key={el.id}
          title={el.label}
          onClick={() => onAdd(el.id)}
          className="flex aspect-square items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <path d={el.path} fill="currentColor" />
          </svg>
        </button>
      ))}
    </div>
  )
}
