import { ChevronDown, ChevronUp, Copy, Eye, EyeOff, Image as ImageIcon, Lock, Paintbrush, Shapes, Sparkles, Trash2, Type, Unlock } from 'lucide-react'
import { useState } from 'react'
import type { Layer } from '../../lib/photo-editor/types'

interface LayersPanelProps {
  layers: Layer[]
  selectedId: string | null
  onSelect: (id: string) => void
  onToggleVisible: (id: string) => void
  onToggleLock: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onMove: (id: string, direction: 'up' | 'down') => void
  onRename: (id: string, name: string) => void
}

function layerIcon(layer: Layer) {
  switch (layer.type) {
    case 'image':
      return ImageIcon
    case 'text':
      return Type
    case 'shape':
      return Shapes
    case 'drawing':
      return Paintbrush
    case 'icon':
      return Sparkles
  }
}

export function LayersPanel({ layers, selectedId, onSelect, onToggleVisible, onToggleLock, onDuplicate, onDelete, onMove, onRename }: LayersPanelProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const ordered = [...layers].reverse()

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Capas</div>
      {ordered.length === 0 && <p className="py-6 text-center text-xs text-slate-400">Todavía no hay capas.</p>}
      <div className="flex flex-col gap-1">
        {ordered.map((layer, displayIndex) => {
          const Icon = layerIcon(layer)
          const active = layer.id === selectedId
          const isTop = displayIndex === 0
          const isBottom = displayIndex === ordered.length - 1
          return (
            <div
              key={layer.id}
              onClick={() => onSelect(layer.id)}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition ${
                active ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {renamingId === layer.id ? (
                <input
                  autoFocus
                  defaultValue={layer.name}
                  onClick={e => e.stopPropagation()}
                  onBlur={e => {
                    onRename(layer.id, e.target.value || layer.name)
                    setRenamingId(null)
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                    if (e.key === 'Escape') setRenamingId(null)
                  }}
                  className="min-w-0 flex-1 rounded border border-violet-300 px-1 py-0.5 text-xs focus:outline-none"
                />
              ) : (
                <span
                  onDoubleClick={e => {
                    e.stopPropagation()
                    setRenamingId(layer.id)
                  }}
                  className="min-w-0 flex-1 truncate"
                  title="Doble clic para renombrar"
                >
                  {layer.name}
                </span>
              )}
              <button
                title={isTop ? undefined : 'Subir capa'}
                disabled={isTop}
                onClick={e => {
                  e.stopPropagation()
                  onMove(layer.id, 'up')
                }}
                className="text-slate-300 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-20"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                title={isBottom ? undefined : 'Bajar capa'}
                disabled={isBottom}
                onClick={e => {
                  e.stopPropagation()
                  onMove(layer.id, 'down')
                }}
                className="text-slate-300 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-20"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button
                title={layer.visible ? 'Ocultar' : 'Mostrar'}
                onClick={e => {
                  e.stopPropagation()
                  onToggleVisible(layer.id)
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                {layer.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
              <button
                title={layer.locked ? 'Desbloquear' : 'Bloquear'}
                onClick={e => {
                  e.stopPropagation()
                  onToggleLock(layer.id)
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                {layer.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
              </button>
              <button
                title="Duplicar"
                onClick={e => {
                  e.stopPropagation()
                  onDuplicate(layer.id)
                }}
                className="text-slate-400 hover:text-slate-700"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                title="Eliminar"
                onClick={e => {
                  e.stopPropagation()
                  onDelete(layer.id)
                }}
                className="text-slate-400 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
