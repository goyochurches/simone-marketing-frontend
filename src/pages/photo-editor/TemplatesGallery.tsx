import { useMemo } from 'react'
import { TEMPLATES, type Template } from '../../lib/photo-editor/templates'
import type { EditorDocument } from '../../lib/photo-editor/types'
import { Modal } from './Modal'
import { MiniCanvasPreview } from './MiniCanvasPreview'

interface TemplatesGalleryProps {
  open: boolean
  onClose: () => void
  targetSize: { width: number; height: number }
  onApply: (template: Template) => void
}

export function TemplatesGallery({ open, onClose, targetSize, onApply }: TemplatesGalleryProps) {
  const previewDocs = useMemo<Record<string, EditorDocument>>(() => {
    const docs: Record<string, EditorDocument> = {}
    for (const t of TEMPLATES) {
      docs[t.id] = {
        id: t.id,
        width: targetSize.width,
        height: targetSize.height,
        background: t.background ?? '#ffffff',
        layers: t.build(targetSize.width, targetSize.height),
      }
    }
    return docs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSize.width, targetSize.height])

  return (
    <Modal open={open} onClose={onClose} title="Plantillas">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => onApply(t)}
            className="group flex flex-col gap-2 rounded-xl border border-slate-200 p-2 text-left transition hover:border-violet-300 hover:bg-violet-50"
          >
            <div className="flex items-center justify-center overflow-hidden rounded-lg bg-slate-100" style={{ aspectRatio: `${targetSize.width} / ${targetSize.height}` }}>
              <MiniCanvasPreview doc={previewDocs[t.id]} className="h-full w-full object-contain" />
            </div>
            <span className="text-xs font-medium text-slate-700 group-hover:text-violet-700">{t.label}</span>
          </button>
        ))}
      </div>
    </Modal>
  )
}
