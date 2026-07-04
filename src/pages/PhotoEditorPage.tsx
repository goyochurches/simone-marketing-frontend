import { useCallback, useEffect, useRef, useState } from 'react'
import { useHistoryState } from '../hooks/useHistoryState'
import { addLayer, cropDocument, duplicateLayerInDoc, findLayer, moveLayer, removeLayer, updateLayer } from '../lib/photo-editor/docOps'
import { DOCUMENT_PRESETS, createEmptyDocument, createImageLayer } from '../lib/photo-editor/factory'
import { renderDocument } from '../lib/photo-editor/render'
import type { EditorDocument, Layer, ToolId } from '../lib/photo-editor/types'
import { CanvasStage } from './photo-editor/CanvasStage'
import { LayersPanel } from './photo-editor/LayersPanel'
import { PropertiesPanel } from './photo-editor/PropertiesPanel'
import { Toolbar } from './photo-editor/Toolbar'

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
}

export function PhotoEditorPage() {
  const history = useHistoryState<EditorDocument>(createEmptyDocument())
  const doc = history.state

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tool, setTool] = useState<ToolId>('select')
  const [brushColor, setBrushColor] = useState('#111827')
  const [brushSize, setBrushSize] = useState(10)
  const [cropRect, setCropRect] = useState<Rect | null>(null)

  const editOriginRef = useRef<EditorDocument | null>(null)

  const selectedLayer: Layer | null = selectedId ? findLayer(doc, selectedId) ?? null : null

  const setDoc = useCallback(
    (updater: EditorDocument | ((prev: EditorDocument) => EditorDocument), options?: { commit?: boolean }) => {
      history.set(updater, options)
    },
    [history],
  )

  function selectTool(next: ToolId) {
    if (next !== 'crop') setCropRect(null)
    if (next === 'crop') setCropRect({ x: 0, y: 0, width: doc.width, height: doc.height })
    setTool(next)
  }

  function handleApplyCrop() {
    if (cropRect && cropRect.width > 4 && cropRect.height > 4) {
      setDoc(prev => cropDocument(prev, cropRect))
    }
    setCropRect(null)
    setTool('select')
  }

  function handleCancelCrop() {
    setCropRect(null)
    setTool('select')
  }

  function handleUploadImage(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      const probe = new Image()
      probe.onload = () => {
        const layer = createImageLayer(src, doc, { width: probe.naturalWidth, height: probe.naturalHeight })
        setDoc(prev => addLayer(prev, layer))
        setSelectedId(layer.id)
        setTool('select')
      }
      probe.src = src
    }
    reader.readAsDataURL(file)
  }

  function handleExport() {
    const canvas = window.document.createElement('canvas')
    canvas.width = doc.width
    canvas.height = doc.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    renderDocument(ctx, doc)
    const url = canvas.toDataURL('image/png')
    const link = window.document.createElement('a')
    link.href = url
    link.download = 'diseno-simone.png'
    link.click()
  }

  const updateLive = useCallback(
    (fn: (layer: Layer) => Layer) => {
      if (!selectedId) return
      setDoc(prev => updateLayer(prev, selectedId, fn), { commit: false })
    },
    [selectedId, setDoc],
  )

  const updateNow = useCallback(
    (fn: (layer: Layer) => Layer) => {
      if (!selectedId) return
      setDoc(prev => updateLayer(prev, selectedId, fn))
    },
    [selectedId, setDoc],
  )

  const beginEdit = useCallback(() => {
    editOriginRef.current = doc
  }, [doc])

  const endEdit = useCallback(() => {
    if (editOriginRef.current) {
      history.commitDrag(editOriginRef.current)
      editOriginRef.current = null
    }
  }, [history])

  function deleteLayer(id: string) {
    setDoc(prev => removeLayer(prev, id))
    if (selectedId === id) setSelectedId(null)
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return
      const meta = e.ctrlKey || e.metaKey
      if (meta && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        history.undo()
      } else if (meta && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault()
        history.redo()
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        deleteLayer(selectedId)
      } else if (e.key === 'Escape') {
        if (tool === 'crop') handleCancelCrop()
        else setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, tool, history])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editor de fotos</h1>
          <p className="mt-1 text-sm text-slate-500">Recorta, escribe, dibuja y aplica filtros antes de publicar en Instagram.</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          Tamaño de lienzo
          <select
            value={`${doc.width}x${doc.height}`}
            onChange={e => {
              const preset = DOCUMENT_PRESETS.find(p => `${p.width}x${p.height}` === e.target.value)
              if (preset) setDoc(prev => ({ ...prev, width: preset.width, height: preset.height }))
            }}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700"
          >
            {DOCUMENT_PRESETS.map(p => (
              <option key={p.id} value={`${p.width}x${p.height}`}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Toolbar
        tool={tool}
        setTool={selectTool}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onUndo={history.undo}
        onRedo={history.redo}
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        onUploadImage={handleUploadImage}
        onApplyCrop={handleApplyCrop}
        onCancelCrop={handleCancelCrop}
        onExport={handleExport}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px_280px]">
        <CanvasStage
          doc={doc}
          setDoc={setDoc}
          commitDrag={history.commitDrag}
          selectedId={selectedId}
          onSelect={setSelectedId}
          tool={tool}
          onToolComplete={() => setTool('select')}
          brushColor={brushColor}
          brushSize={brushSize}
          cropRect={cropRect}
          setCropRect={setCropRect}
        />

        <LayersPanel
          layers={doc.layers}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onToggleVisible={id => setDoc(prev => updateLayer(prev, id, l => ({ ...l, visible: !l.visible })))}
          onToggleLock={id => setDoc(prev => updateLayer(prev, id, l => ({ ...l, locked: !l.locked })))}
          onDuplicate={id => {
            const result = duplicateLayerInDoc(doc, id)
            setDoc(result.doc)
            if (result.newId) setSelectedId(result.newId)
          }}
          onDelete={deleteLayer}
          onMove={(id, direction) => setDoc(prev => moveLayer(prev, id, direction))}
          onRename={(id, name) => setDoc(prev => updateLayer(prev, id, l => ({ ...l, name })))}
        />

        <PropertiesPanel layer={selectedLayer} updateLive={updateLive} updateNow={updateNow} beginEdit={beginEdit} endEdit={endEdit} onDelete={() => selectedId && deleteLayer(selectedId)} />
      </div>
    </div>
  )
}
