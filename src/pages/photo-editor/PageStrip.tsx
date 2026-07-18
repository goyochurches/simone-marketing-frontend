import { ChevronLeft, ChevronRight, Copy, Plus, Trash2 } from 'lucide-react'
import type { EditorDocument } from '../../lib/photo-editor/types'
import { MiniCanvasPreview } from './MiniCanvasPreview'

interface PageStripProps {
  pages: EditorDocument[]
  activePageId: string
  onSelectPage: (id: string) => void
  onAddPage: () => void
  onDuplicatePage: (id: string) => void
  onDeletePage: (id: string) => void
  onMovePage: (id: string, direction: 'left' | 'right') => void
}

export function PageStrip({ pages, activePageId, onSelectPage, onAddPage, onDuplicatePage, onDeletePage, onMovePage }: PageStripProps) {
  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Páginas{pages.length > 1 ? ` — carrusel de ${pages.length}` : ''}
        </span>
        <button
          onClick={onAddPage}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Página
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {pages.map((page, index) => {
          const active = page.id === activePageId
          return (
            <div key={page.id} className="flex shrink-0 flex-col items-center gap-1">
              <button
                onClick={() => onSelectPage(page.id)}
                title={`Página ${index + 1}`}
                className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border-2 bg-slate-50 transition ${
                  active ? 'border-violet-500 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <MiniCanvasPreview doc={page} className="h-full w-full object-contain" />
              </button>
              <div className="flex items-center gap-1">
                <button
                  title="Mover a la izquierda"
                  disabled={index === 0}
                  onClick={() => onMovePage(page.id, 'left')}
                  className="text-slate-300 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-20"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <span className="text-[10px] text-slate-400">{index + 1}</span>
                <button
                  title="Mover a la derecha"
                  disabled={index === pages.length - 1}
                  onClick={() => onMovePage(page.id, 'right')}
                  className="text-slate-300 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-20"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
                <button title="Duplicar página" onClick={() => onDuplicatePage(page.id)} className="text-slate-300 hover:text-slate-600">
                  <Copy className="h-3 w-3" />
                </button>
                <button
                  title="Eliminar página"
                  disabled={pages.length <= 1}
                  onClick={() => onDeletePage(page.id)}
                  className="text-slate-300 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-20"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
