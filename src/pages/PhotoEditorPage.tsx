import { useCallback, useEffect, useRef, useState } from 'react'
import { useHistoryState } from '../hooks/useHistoryState'
import { addLayer, cropDocument, duplicateLayerInDoc, findLayer, moveLayer, removeLayer, updateLayer } from '../lib/photo-editor/docOps'
import { DOCUMENT_PRESETS, createEmptyDocument, createImageLayer } from '../lib/photo-editor/factory'
import { addPage, createBlankPage, duplicatePage, removePage, reorderPage, resizeAllPages } from '../lib/photo-editor/pageOps'
import { renderDocument } from '../lib/photo-editor/render'
import type { EditorDocument, Layer, ToolId } from '../lib/photo-editor/types'
import { CanvasStage } from './photo-editor/CanvasStage'
import { LayersPanel } from './photo-editor/LayersPanel'
import { PageStrip } from './photo-editor/PageStrip'
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

function exportPageToPng(doc: EditorDocument, filename: string) {
  const canvas = window.document.createElement('canvas')
  canvas.width = doc.width
  canvas.height = doc.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  renderDocument(ctx, doc)
  const url = canvas.toDataURL('image/png')
  const link = window.document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
}

export function PhotoEditorPage() {
  const history = useHistoryState<EditorDocument[]>([createEmptyDocument()])
  const pages = history.state
  const [activePageId, setActivePageId] = useState(pages[0].id)
  const doc = pages.find(p => p.id === activePageId) ?? pages[0]

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tool, setTool] = useState<ToolId>('select')
  const [brushColor, setBrushColor] = useState('#111827')
  const [brushSize, setBrushSize] = useState(10)
  const [cropRect, setCropRect] = useState<Rect | null>(null)

  const editOriginRef = useRef<EditorDocument[] | null>(null)

  const selectedLayer: Layer | null = selectedId ? findLayer(doc, selectedId) ?? null : null

  useEffect(() => {
    if (!pages.some(p => p.id === activePageId)) {
      setActivePageId(pages[0].id)
      setSelectedId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages])

  const setDoc = useCallback(
    (updater: EditorDocument | ((prev: EditorDocument) => EditorDocument), options?: { commit?: boolean }) => {
      history.set(prevPages => prevPages.map(p => (p.id === activePageId ? (typeof updater === 'function' ? updater(p) : updater) : p)), options)
    },
    [history, activePageId],
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

  function handleExportCurrent() {
    exportPageToPng(doc, 'diseno-simone.png')
  }

  function handleExportAll() {
    pages.forEach((p, i) => {
      window.setTimeout(() => exportPageToPng(p, `diseno-simone-${i + 1}.png`), i * 150)
    })
  }

  function handleResizeCanvas(width: number, height: number) {
    history.set(prev => resizeAllPages(prev, width, height))
  }

  function handleSelectPage(id: string) {
    if (tool === 'crop') handleCancelCrop()
    setActivePageId(id)
    setSelectedId(null)
  }

  function handleAddPage() {
    const activeIndex = pages.findIndex(p => p.id === activePageId)
    const newPage = createBlankPage(doc.width, doc.height)
    history.set(prev => addPage(prev, newPage, activeIndex + 1))
    handleSelectPage(newPage.id)
  }

  function handleDuplicatePage(id: string) {
    const result = duplicatePage(pages, id)
    history.set(result.pages)
    if (result.newId) handleSelectPage(result.newId)
  }

  function handleDeletePage(id: string) {
    if (pages.length <= 1) return
    const deletedIndex = pages.findIndex(p => p.id === id)
    const next = removePage(pages, id)
    history.set(next)
    if (id === activePageId) {
      const fallback = next[Math.min(deletedIndex, next.length - 1)]
      handleSelectPage(fallback.id)
    }
  }

  function handleMovePage(id: string, direction: 'left' | 'right') {
    history.set(prev => reorderPage(prev, id, direction))
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
    editOriginRef.current = pages
  }, [pages])

  const endEdit = useCallback(() => {
    if (editOriginRef.current) {
      history.commitDrag(editOriginRef.current)
      editOriginRef.current = null
    }
  }, [history])

  const commitPageDrag = useCallback(
    (origin: EditorDocument) => {
      history.commitDrag(pages.map(p => (p.id === activePageId ? origin : p)))
    },
    [history, pages, activePageId],
  )

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
              if (preset) handleResizeCanvas(preset.width, preset.height)
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
        onExportCurrent={handleExportCurrent}
        onExportAll={handleExportAll}
        pageCount={pages.length}
      />

      <PageStrip
        pages={pages}
        activePageId={activePageId}
        onSelectPage={handleSelectPage}
        onAddPage={handleAddPage}
        onDuplicatePage={handleDuplicatePage}
        onDeletePage={handleDeletePage}
        onMovePage={handleMovePage}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px_280px]">
        <CanvasStage
          doc={doc}
          setDoc={setDoc}
          commitDrag={commitPageDrag}
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
