import {
  DEFAULT_FILTERS,
  DEFAULT_TEXT_SHADOW,
  DEFAULT_TEXT_STROKE,
  type DrawingLayer,
  type EditorDocument,
  type ImageLayer,
  type Layer,
  type ShapeKind,
  type ShapeLayer,
  type TextLayer,
} from './types'

export interface DocumentPreset {
  id: string
  label: string
  width: number
  height: number
}

export const DOCUMENT_PRESETS: DocumentPreset[] = [
  { id: 'ig-post', label: 'Post cuadrado (1080x1080)', width: 1080, height: 1080 },
  { id: 'ig-portrait', label: 'Post vertical (1080x1350)', width: 1080, height: 1350 },
  { id: 'ig-story', label: 'Story / Reel (1080x1920)', width: 1080, height: 1920 },
  { id: 'ig-landscape', label: 'Horizontal (1080x608)', width: 1080, height: 608 },
]

function id(): string {
  return crypto.randomUUID()
}

export function createEmptyDocument(width = 1080, height = 1080): EditorDocument {
  return { id: id(), width, height, background: '#ffffff', layers: [] }
}

export function createImageLayer(src: string, doc: EditorDocument, natural?: { width: number; height: number }): ImageLayer {
  let width = doc.width * 0.8
  let height = doc.height * 0.8
  if (natural && natural.width > 0 && natural.height > 0) {
    const ratio = natural.width / natural.height
    const boxRatio = doc.width / doc.height
    if (ratio > boxRatio) {
      width = doc.width * 0.9
      height = width / ratio
    } else {
      height = doc.height * 0.9
      width = height * ratio
    }
  }
  return {
    id: id(),
    type: 'image',
    name: 'Imagen',
    x: doc.width / 2,
    y: doc.height / 2,
    width,
    height,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    src,
    flipX: false,
    flipY: false,
    filters: { ...DEFAULT_FILTERS },
  }
}

export function createTextLayer(doc: EditorDocument): TextLayer {
  return {
    id: id(),
    type: 'text',
    name: 'Texto',
    x: doc.width / 2,
    y: doc.height / 2,
    width: 320,
    height: 60,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    text: 'Tu texto aquí',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 48,
    fontWeight: 'bold',
    fontStyle: 'normal',
    color: '#111827',
    align: 'center',
    letterSpacing: 0,
    shadow: { ...DEFAULT_TEXT_SHADOW },
    textStroke: { ...DEFAULT_TEXT_STROKE },
  }
}

function baseShapeLayer(shape: ShapeKind, x: number, y: number, width: number, height: number): ShapeLayer {
  return {
    id: id(),
    type: 'shape',
    name: shapeName(shape),
    x,
    y,
    width,
    height,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    shape,
    fill: '#7c3aed',
    stroke: '#5b21b6',
    strokeWidth: 4,
    fillEnabled: shape !== 'line',
    strokeEnabled: true,
  }
}

export function createShapeLayer(shape: ShapeKind, doc: EditorDocument): ShapeLayer {
  const width = shape === 'line' ? 240 : 220
  const height = shape === 'line' ? 160 : 220
  return baseShapeLayer(shape, doc.width / 2, doc.height / 2, width, height)
}

export function createShapeLayerAt(shape: ShapeKind, rect: { x: number; y: number; width: number; height: number }): ShapeLayer {
  return baseShapeLayer(shape, rect.x + rect.width / 2, rect.y + rect.height / 2, Math.max(8, rect.width), Math.max(8, rect.height))
}

function shapeName(shape: ShapeKind): string {
  switch (shape) {
    case 'rect':
      return 'Rectángulo'
    case 'ellipse':
      return 'Elipse'
    case 'triangle':
      return 'Triángulo'
    case 'line':
      return 'Línea'
  }
}

export function createDrawingLayer(width: number, height: number): DrawingLayer {
  return {
    id: id(),
    type: 'drawing',
    name: 'Dibujo',
    x: width / 2,
    y: height / 2,
    width,
    height,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    strokes: [],
    baseWidth: width,
    baseHeight: height,
  }
}

export function duplicateLayer(layer: Layer): Layer {
  return { ...layer, id: id(), name: `${layer.name} copia`, x: layer.x + 24, y: layer.y + 24 }
}
