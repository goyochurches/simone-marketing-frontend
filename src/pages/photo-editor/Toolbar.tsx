import {
  Circle,
  Crop,
  Download,
  LayoutTemplate,
  Minus,
  MousePointer2,
  Paintbrush,
  Redo2,
  Sparkles,
  Square,
  Triangle,
  Type,
  Undo2,
  Upload,
} from 'lucide-react'
import { useState } from 'react'
import type { ToolId } from '../../lib/photo-editor/types'
import { ElementsPanel } from './ElementsPanel'

const TOOLS: { id: ToolId; label: string; icon: typeof MousePointer2 }[] = [
  { id: 'select', label: 'Seleccionar', icon: MousePointer2 },
  { id: 'text', label: 'Texto', icon: Type },
  { id: 'rect', label: 'Rectángulo', icon: Square },
  { id: 'ellipse', label: 'Elipse', icon: Circle },
  { id: 'triangle', label: 'Triángulo', icon: Triangle },
  { id: 'line', label: 'Línea', icon: Minus },
  { id: 'brush', label: 'Pincel', icon: Paintbrush },
  { id: 'crop', label: 'Recortar', icon: Crop },
]

interface ToolbarProps {
  tool: ToolId
  setTool: (t: ToolId) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  brushColor: string
  setBrushColor: (c: string) => void
  brushSize: number
  setBrushSize: (s: number) => void
  onUploadImage: (file: File) => void
  onApplyCrop: () => void
  onCancelCrop: () => void
  onExportCurrent: () => void
  onExportAll: () => void
  pageCount: number
  onAddIcon: (iconId: string) => void
}

export function Toolbar({
  tool,
  setTool,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  brushColor,
  setBrushColor,
  brushSize,
  setBrushSize,
  onUploadImage,
  onApplyCrop,
  onCancelCrop,
  onExportCurrent,
  onExportAll,
  pageCount,
  onAddIcon,
}: ToolbarProps) {
  const [elementsOpen, setElementsOpen] = useState(false)
  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
          {TOOLS.map(t => {
            const Icon = t.icon
            const active = tool === t.id
            return (
              <button
                key={t.id}
                title={t.label}
                onClick={() => setTool(t.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  active ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            )
          })}
        </div>

        <div className="flex gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
          <button
            title="Deshacer"
            disabled={!canUndo}
            onClick={onUndo}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            title="Rehacer"
            disabled={!canRedo}
            onClick={onRedo}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <label
          title="Subir imagen"
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:text-slate-800"
        >
          <Upload className="h-3.5 w-3.5" />
          Subir imagen
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) onUploadImage(file)
              e.target.value = ''
            }}
          />
        </label>

        <div className="relative">
          <button
            onClick={() => setElementsOpen(o => !o)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              elementsOpen ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-600 hover:text-slate-800'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Elementos
          </button>
          {elementsOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setElementsOpen(false)} />
              <div className="absolute left-0 top-full z-20 mt-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                <ElementsPanel
                  onAdd={iconId => {
                    onAddIcon(iconId)
                    setElementsOpen(false)
                  }}
                />
              </div>
            </>
          )}
        </div>

        {pageCount > 1 ? (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onExportCurrent}
              className="flex items-center gap-1.5 rounded-full border border-violet-200 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              <Download className="h-3.5 w-3.5" />
              Descargar actual
            </button>
            <button
              onClick={onExportAll}
              className="flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700"
            >
              <Download className="h-3.5 w-3.5" />
              Descargar todas
            </button>
          </div>
        ) : (
          <button
            onClick={onExportCurrent}
            className="ml-auto flex items-center gap-1.5 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700"
          >
            <Download className="h-3.5 w-3.5" />
            Descargar PNG
          </button>
        )}
      </div>

      {tool === 'brush' && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pincel</span>
          <input
            type="color"
            value={brushColor}
            onChange={e => setBrushColor(e.target.value)}
            className="h-6 w-8 cursor-pointer rounded border border-slate-200"
          />
          <input
            type="range"
            min={2}
            max={60}
            value={brushSize}
            onChange={e => setBrushSize(Number(e.target.value))}
            className="w-40"
          />
          <span className="w-8 text-xs text-slate-500">{brushSize}px</span>
        </div>
      )}

      {tool === 'crop' && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recorte</span>
          <button
            onClick={onApplyCrop}
            className="rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-violet-700"
          >
            Aplicar recorte
          </button>
          <button
            onClick={onCancelCrop}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 transition hover:text-slate-700"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
