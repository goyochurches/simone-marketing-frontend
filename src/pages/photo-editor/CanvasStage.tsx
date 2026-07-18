import { useCallback, useEffect, useRef, useState } from 'react'
import { addLayer, updateLayer } from '../../lib/photo-editor/docOps'
import { createDrawingLayer, createShapeLayer, createShapeLayerAt, createTextLayer } from '../../lib/photo-editor/factory'
import { ensureImageLoaded, subscribeImageCache } from '../../lib/photo-editor/imageCache'
import {
  MIN_SIZE,
  HANDLE_HIT_RADIUS,
  angleBetween,
  beginResize,
  boundsOfPoints,
  computeResize,
  findHandleAt,
  hitTestLayer,
  layerCenter,
} from '../../lib/photo-editor/geometry'
import { drawCropOverlay, drawRectOverlay, drawSelectionOverlay, renderDocument } from '../../lib/photo-editor/render'
import type { EditorDocument, ShapeKind, ToolId, Vec2 } from '../../lib/photo-editor/types'

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

type CropHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

type DragState =
  | { mode: 'move'; origin: EditorDocument; layerId: string; startPointer: Vec2; startLayerPos: Vec2 }
  | { mode: 'resize'; origin: EditorDocument; layerId: string; resize: ReturnType<typeof beginResize> }
  | { mode: 'rotate'; origin: EditorDocument; layerId: string; center: Vec2; startAngle: number; startRotation: number }
  | { mode: 'draw' }
  | { mode: 'create'; shape: ShapeKind; start: Vec2 }
  | { mode: 'crop-move'; start: Vec2; startRect: Rect }
  | { mode: 'crop-resize'; handle: CropHandle; startRect: Rect }

interface CanvasStageProps {
  doc: EditorDocument
  setDoc: (updater: EditorDocument | ((prev: EditorDocument) => EditorDocument), options?: { commit?: boolean }) => void
  commitDrag: (origin: EditorDocument) => void
  selectedId: string | null
  onSelect: (id: string | null) => void
  tool: ToolId
  onToolComplete: () => void
  brushColor: string
  brushSize: number
  cropRect: Rect | null
  setCropRect: (rect: Rect | null) => void
}

function cropHandlePositions(r: Rect): Record<CropHandle, Vec2> {
  return {
    nw: { x: r.x, y: r.y },
    n: { x: r.x + r.width / 2, y: r.y },
    ne: { x: r.x + r.width, y: r.y },
    e: { x: r.x + r.width, y: r.y + r.height / 2 },
    se: { x: r.x + r.width, y: r.y + r.height },
    s: { x: r.x + r.width / 2, y: r.y + r.height },
    sw: { x: r.x, y: r.y + r.height },
    w: { x: r.x, y: r.y + r.height / 2 },
  }
}

function findCropHandleAt(p: Vec2, r: Rect, screenScale: number): CropHandle | null {
  const radius = HANDLE_HIT_RADIUS / screenScale
  const positions = cropHandlePositions(r)
  for (const key of Object.keys(positions) as CropHandle[]) {
    const pos = positions[key]
    if (Math.hypot(p.x - pos.x, p.y - pos.y) <= radius) return key
  }
  return null
}

function pointInRect(p: Vec2, r: Rect): boolean {
  return p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height
}

function clampRectToDoc(r: Rect, doc: EditorDocument): Rect {
  const width = Math.min(r.width, doc.width)
  const height = Math.min(r.height, doc.height)
  const x = Math.min(Math.max(r.x, 0), doc.width - width)
  const y = Math.min(Math.max(r.y, 0), doc.height - height)
  return { x, y, width, height }
}

function computeCropResize(startRect: Rect, handle: CropHandle, pointer: Vec2, doc: EditorDocument): Rect {
  const left = startRect.x
  const top = startRect.y
  const right = startRect.x + startRect.width
  const bottom = startRect.y + startRect.height
  let newLeft = left
  let newTop = top
  let newRight = right
  let newBottom = bottom
  if (handle.includes('w')) newLeft = Math.min(pointer.x, right - MIN_SIZE)
  if (handle.includes('e')) newRight = Math.max(pointer.x, left + MIN_SIZE)
  if (handle.includes('n')) newTop = Math.min(pointer.y, bottom - MIN_SIZE)
  if (handle.includes('s')) newBottom = Math.max(pointer.y, top + MIN_SIZE)
  return clampRectToDoc({ x: newLeft, y: newTop, width: newRight - newLeft, height: newBottom - newTop }, doc)
}

export function CanvasStage({
  doc,
  setDoc,
  commitDrag,
  selectedId,
  onSelect,
  tool,
  onToolComplete,
  brushColor,
  brushSize,
  cropRect,
  setCropRect,
}: CanvasStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const liveStrokeRef = useRef<Vec2[] | null>(null)
  const [draftRect, setDraftRect] = useState<Rect | null>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    renderDocument(ctx, doc)
    const rect = canvas.getBoundingClientRect()
    const screenScale = rect.width > 0 ? rect.width / doc.width : 1

    if (tool === 'crop') {
      const r = cropRect ?? { x: 0, y: 0, width: doc.width, height: doc.height }
      drawCropOverlay(ctx, doc, r, screenScale)
    } else if (selectedId) {
      const layer = doc.layers.find(l => l.id === selectedId)
      if (layer && layer.visible) drawSelectionOverlay(ctx, layer, screenScale)
    }

    if (draftRect) {
      drawRectOverlay(ctx, draftRect, screenScale)
    }

    if (liveStrokeRef.current && liveStrokeRef.current.length > 0) {
      ctx.save()
      ctx.strokeStyle = brushColor
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      liveStrokeRef.current.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)))
      ctx.stroke()
      ctx.restore()
    }
  }, [doc, selectedId, tool, cropRect, draftRect, brushColor, brushSize])

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [draw])

  useEffect(() => {
    for (const layer of doc.layers) {
      if (layer.type === 'image') ensureImageLoaded(layer.src)
    }
    return subscribeImageCache(draw)
  }, [doc.layers, draw])

  useEffect(() => {
    document.fonts.ready.then(draw)
  }, [draw])

  function getDocPoint(e: { clientX: number; clientY: number }): Vec2 {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = rect.width > 0 ? doc.width / rect.width : 1
    const scaleY = rect.height > 0 ? doc.height / rect.height : 1
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  function screenScaleNow(): number {
    const canvas = canvasRef.current
    if (!canvas) return 1
    const rect = canvas.getBoundingClientRect()
    return rect.width > 0 ? rect.width / doc.width : 1
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    ;(e.target as Element).setPointerCapture(e.pointerId)
    const p = getDocPoint(e)

    if (tool === 'crop') {
      const rect = cropRect ?? { x: 0, y: 0, width: doc.width, height: doc.height }
      const handle = findCropHandleAt(p, rect, screenScaleNow())
      if (handle) {
        dragRef.current = { mode: 'crop-resize', handle, startRect: rect }
        return
      }
      if (pointInRect(p, rect)) {
        dragRef.current = { mode: 'crop-move', start: p, startRect: rect }
        return
      }
      const fresh = { x: p.x, y: p.y, width: 0, height: 0 }
      setCropRect(fresh)
      dragRef.current = { mode: 'crop-resize', handle: 'se', startRect: fresh }
      return
    }

    if (tool === 'brush') {
      liveStrokeRef.current = [p]
      dragRef.current = { mode: 'draw' }
      draw()
      return
    }

    if (tool === 'rect' || tool === 'ellipse' || tool === 'triangle' || tool === 'line') {
      dragRef.current = { mode: 'create', shape: tool, start: p }
      setDraftRect({ x: p.x, y: p.y, width: 0, height: 0 })
      return
    }

    if (tool === 'text') {
      const layer = createTextLayer(doc)
      layer.x = p.x
      layer.y = p.y
      setDoc(prev => addLayer(prev, layer))
      onSelect(layer.id)
      onToolComplete()
      return
    }

    // select tool: check handles on the currently selected layer first
    if (selectedId) {
      const selected = doc.layers.find(l => l.id === selectedId)
      if (selected && !selected.locked) {
        const handle = findHandleAt(p, selected)
        if (handle === 'rotate') {
          dragRef.current = {
            mode: 'rotate',
            origin: doc,
            layerId: selected.id,
            center: layerCenter(selected),
            startAngle: angleBetween(layerCenter(selected), p),
            startRotation: selected.rotation,
          }
          return
        }
        if (handle) {
          dragRef.current = { mode: 'resize', origin: doc, layerId: selected.id, resize: beginResize(selected, handle) }
          return
        }
      }
    }

    for (let i = doc.layers.length - 1; i >= 0; i--) {
      const layer = doc.layers[i]
      if (!layer.visible) continue
      if (hitTestLayer(p, layer)) {
        onSelect(layer.id)
        if (!layer.locked) {
          dragRef.current = { mode: 'move', origin: doc, layerId: layer.id, startPointer: p, startLayerPos: { x: layer.x, y: layer.y } }
        }
        return
      }
    }
    onSelect(null)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const p = getDocPoint(e)

    switch (drag.mode) {
      case 'draw':
        liveStrokeRef.current?.push(p)
        draw()
        return
      case 'create':
        setDraftRect({
          x: Math.min(drag.start.x, p.x),
          y: Math.min(drag.start.y, p.y),
          width: Math.abs(p.x - drag.start.x),
          height: Math.abs(p.y - drag.start.y),
        })
        return
      case 'move': {
        const dx = p.x - drag.startPointer.x
        const dy = p.y - drag.startPointer.y
        setDoc(prev => updateLayer(prev, drag.layerId, l => ({ ...l, x: drag.startLayerPos.x + dx, y: drag.startLayerPos.y + dy })), {
          commit: false,
        })
        return
      }
      case 'resize': {
        const result = computeResize(drag.resize, p)
        setDoc(prev => updateLayer(prev, drag.layerId, l => ({ ...l, ...result })), { commit: false })
        return
      }
      case 'rotate': {
        const angle = angleBetween(drag.center, p)
        const rotation = drag.startRotation + (angle - drag.startAngle)
        setDoc(prev => updateLayer(prev, drag.layerId, l => ({ ...l, rotation })), { commit: false })
        return
      }
      case 'crop-move': {
        const dx = p.x - drag.start.x
        const dy = p.y - drag.start.y
        setCropRect(clampRectToDoc({ ...drag.startRect, x: drag.startRect.x + dx, y: drag.startRect.y + dy }, doc))
        return
      }
      case 'crop-resize': {
        setCropRect(computeCropResize(drag.startRect, drag.handle, p, doc))
        return
      }
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current
    dragRef.current = null
    if (!drag) return

    if (drag.mode === 'draw') {
      const points = liveStrokeRef.current ?? []
      liveStrokeRef.current = null
      if (points.length > 0) {
        const normalized = points.length > 1 ? points : [points[0], { x: points[0].x + 1, y: points[0].y + 1 }]
        const bounds = boundsOfPoints(normalized)
        const localPoints = points.map(pt => ({ x: pt.x - bounds.x, y: pt.y - bounds.y }))
        const layer = createDrawingLayer(bounds.width, bounds.height)
        layer.x = bounds.x + bounds.width / 2
        layer.y = bounds.y + bounds.height / 2
        layer.strokes = [{ points: localPoints, color: brushColor, size: brushSize }]
        setDoc(prev => addLayer(prev, layer))
        onSelect(layer.id)
      } else {
        draw()
      }
      return
    }

    if (drag.mode === 'create') {
      setDraftRect(null)
      const p = getDocPoint(e)
      let rect: Rect = {
        x: Math.min(drag.start.x, p.x),
        y: Math.min(drag.start.y, p.y),
        width: Math.abs(p.x - drag.start.x),
        height: Math.abs(p.y - drag.start.y),
      }
      if (rect.width < 6 || rect.height < 6) {
        const defaults = createShapeLayer(drag.shape, doc)
        rect = { x: drag.start.x - defaults.width / 2, y: drag.start.y - defaults.height / 2, width: defaults.width, height: defaults.height }
      }
      const layer = createShapeLayerAt(drag.shape, rect)
      setDoc(prev => addLayer(prev, layer))
      onSelect(layer.id)
      onToolComplete()
      return
    }

    if (drag.mode === 'move' || drag.mode === 'resize' || drag.mode === 'rotate') {
      commitDrag(drag.origin)
      return
    }
  }

  const cursor = tool === 'select' ? 'default' : 'crosshair'

  return (
    <div className="flex w-full items-center justify-center overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-6">
      <div className="max-w-full" style={{ width: Math.min(doc.width, 720), aspectRatio: `${doc.width} / ${doc.height}` }}>
        <canvas
          ref={canvasRef}
          width={doc.width}
          height={doc.height}
          className="h-full w-full touch-none rounded-lg bg-white shadow-md"
          style={{ cursor }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </div>
    </div>
  )
}
