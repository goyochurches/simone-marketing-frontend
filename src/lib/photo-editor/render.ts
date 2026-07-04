import { getCachedImage } from './imageCache'
import { getHandlePositions } from './geometry'
import type { DrawingLayer, EditorDocument, ImageFilters, ImageLayer, Layer, ShapeLayer, TextLayer } from './types'

export function filterString(f: ImageFilters): string {
  return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%) grayscale(${f.grayscale}%) sepia(${f.sepia}%) blur(${f.blur}px) hue-rotate(${f.hueRotate}deg) invert(${f.invert}%)`
}

export function renderDocument(ctx: CanvasRenderingContext2D, doc: EditorDocument): void {
  ctx.save()
  ctx.clearRect(0, 0, doc.width, doc.height)
  ctx.fillStyle = doc.background
  ctx.fillRect(0, 0, doc.width, doc.height)

  for (const layer of doc.layers) {
    if (!layer.visible) continue
    ctx.save()
    ctx.globalAlpha = layer.opacity
    ctx.translate(layer.x, layer.y)
    ctx.rotate(layer.rotation)
    drawLayerContent(ctx, layer)
    ctx.restore()
  }
  ctx.restore()
}

function drawLayerContent(ctx: CanvasRenderingContext2D, layer: Layer): void {
  switch (layer.type) {
    case 'image':
      drawImageLayer(ctx, layer)
      return
    case 'text':
      drawTextLayer(ctx, layer)
      return
    case 'shape':
      drawShapeLayer(ctx, layer)
      return
    case 'drawing':
      drawDrawingLayer(ctx, layer)
      return
  }
}

function drawImageLayer(ctx: CanvasRenderingContext2D, layer: ImageLayer): void {
  ctx.save()
  ctx.scale(layer.flipX ? -1 : 1, layer.flipY ? -1 : 1)
  const img = getCachedImage(layer.src)
  if (img) {
    ctx.filter = filterString(layer.filters)
    ctx.drawImage(img, -layer.width / 2, -layer.height / 2, layer.width, layer.height)
  } else {
    ctx.strokeStyle = '#94a3b8'
    ctx.setLineDash([6, 6])
    ctx.lineWidth = 2
    ctx.strokeRect(-layer.width / 2, -layer.height / 2, layer.width, layer.height)
    ctx.setLineDash([])
  }
  ctx.restore()
}

function drawTextLayer(ctx: CanvasRenderingContext2D, layer: TextLayer): void {
  ctx.font = `${layer.fontStyle} ${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`
  ctx.fillStyle = layer.color
  ctx.textAlign = layer.align
  ctx.textBaseline = 'middle'
  const lines = layer.text.length > 0 ? layer.text.split('\n') : ['']
  const lineHeight = layer.fontSize * 1.25
  const totalHeight = lineHeight * lines.length
  const startY = -totalHeight / 2 + lineHeight / 2
  const xPos = layer.align === 'left' ? -layer.width / 2 : layer.align === 'right' ? layer.width / 2 : 0
  lines.forEach((line, i) => ctx.fillText(line, xPos, startY + i * lineHeight))
}

function drawShapeLayer(ctx: CanvasRenderingContext2D, layer: ShapeLayer): void {
  const w = layer.width
  const h = layer.height
  ctx.beginPath()
  switch (layer.shape) {
    case 'rect':
      ctx.rect(-w / 2, -h / 2, w, h)
      break
    case 'ellipse':
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2)
      break
    case 'triangle':
      ctx.moveTo(0, -h / 2)
      ctx.lineTo(w / 2, h / 2)
      ctx.lineTo(-w / 2, h / 2)
      ctx.closePath()
      break
    case 'line':
      ctx.moveTo(-w / 2, -h / 2)
      ctx.lineTo(w / 2, h / 2)
      break
  }
  if (layer.shape !== 'line' && layer.fillEnabled) {
    ctx.fillStyle = layer.fill
    ctx.fill()
  }
  if (layer.strokeEnabled && layer.strokeWidth > 0) {
    ctx.strokeStyle = layer.stroke
    ctx.lineWidth = layer.strokeWidth
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.stroke()
  }
}

function drawDrawingLayer(ctx: CanvasRenderingContext2D, layer: DrawingLayer): void {
  const scaleX = layer.width / layer.baseWidth
  const scaleY = layer.height / layer.baseHeight
  ctx.save()
  ctx.translate(-layer.width / 2, -layer.height / 2)
  ctx.scale(scaleX || 1, scaleY || 1)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const stroke of layer.strokes) {
    if (stroke.points.length === 0) continue
    ctx.beginPath()
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.size
    stroke.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y)
      else ctx.lineTo(p.x, p.y)
    })
    if (stroke.points.length === 1) {
      const p = stroke.points[0]
      ctx.lineTo(p.x + 0.01, p.y + 0.01)
    }
    ctx.stroke()
  }
  ctx.restore()
}

const HANDLE_SIZE = 9
const ACCENT = '#7c3aed'

/** Draws the selection outline + resize/rotate handles. `screenScale` is CSS-px-per-doc-px, used to keep handle chrome a constant on-screen size regardless of zoom. */
export function drawSelectionOverlay(ctx: CanvasRenderingContext2D, layer: Layer, screenScale: number): void {
  const inv = 1 / screenScale
  const handleSize = HANDLE_SIZE * inv
  const positions = getHandlePositions(layer)

  ctx.save()
  ctx.translate(layer.x, layer.y)
  ctx.rotate(layer.rotation)
  ctx.strokeStyle = ACCENT
  ctx.lineWidth = 1.5 * inv
  ctx.setLineDash([])
  ctx.strokeRect(-layer.width / 2, -layer.height / 2, layer.width, layer.height)

  if (positions.rotate) {
    ctx.beginPath()
    ctx.moveTo(0, -layer.height / 2)
    ctx.lineTo(0, -layer.height / 2 - 28 * inv)
    ctx.stroke()
  }
  ctx.restore()

  if (!layer.locked) {
    for (const [id, pos] of Object.entries(positions)) {
      if (!pos) continue
      ctx.save()
      ctx.translate(pos.x, pos.y)
      ctx.rotate(layer.rotation)
      ctx.beginPath()
      if (id === 'rotate') {
        ctx.arc(0, 0, handleSize / 2, 0, Math.PI * 2)
      } else {
        ctx.rect(-handleSize / 2, -handleSize / 2, handleSize, handleSize)
      }
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      ctx.lineWidth = 1.5 * inv
      ctx.strokeStyle = ACCENT
      ctx.stroke()
      ctx.restore()
    }
  }
}

export function drawRectOverlay(ctx: CanvasRenderingContext2D, rect: { x: number; y: number; width: number; height: number }, screenScale: number): void {
  const inv = 1 / screenScale
  ctx.save()
  ctx.strokeStyle = ACCENT
  ctx.lineWidth = 1.5 * inv
  ctx.setLineDash([5 * inv, 4 * inv])
  ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
  ctx.restore()
}

export function drawCropOverlay(
  ctx: CanvasRenderingContext2D,
  doc: { width: number; height: number },
  rect: { x: number; y: number; width: number; height: number },
  screenScale: number,
): void {
  const inv = 1 / screenScale
  ctx.save()
  ctx.fillStyle = 'rgba(15,23,42,0.55)'
  ctx.fillRect(0, 0, doc.width, rect.y)
  ctx.fillRect(0, rect.y + rect.height, doc.width, doc.height - (rect.y + rect.height))
  ctx.fillRect(0, rect.y, rect.x, rect.height)
  ctx.fillRect(rect.x + rect.width, rect.y, doc.width - (rect.x + rect.width), rect.height)

  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2 * inv
  ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)

  const size = HANDLE_SIZE * inv
  const handles = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width / 2, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height / 2 },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x + rect.width / 2, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height / 2 },
  ]
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = ACCENT
  ctx.lineWidth = 1.5 * inv
  for (const h of handles) {
    ctx.beginPath()
    ctx.rect(h.x - size / 2, h.y - size / 2, size, size)
    ctx.fill()
    ctx.stroke()
  }
  ctx.restore()
}
