export type LayerType = 'image' | 'text' | 'shape' | 'drawing'
export type ShapeKind = 'rect' | 'ellipse' | 'line' | 'triangle'
export type ToolId = 'select' | 'text' | 'rect' | 'ellipse' | 'line' | 'triangle' | 'brush' | 'crop'
export type HandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rotate'

export interface BaseLayer {
  id: string
  type: LayerType
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  visible: boolean
  locked: boolean
}

export interface ImageFilters {
  brightness: number
  contrast: number
  saturate: number
  grayscale: number
  sepia: number
  blur: number
  hueRotate: number
  invert: number
}

export const DEFAULT_FILTERS: ImageFilters = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  blur: 0,
  hueRotate: 0,
  invert: 0,
}

export interface ImageLayer extends BaseLayer {
  type: 'image'
  src: string
  flipX: boolean
  flipY: boolean
  filters: ImageFilters
}

export interface TextLayer extends BaseLayer {
  type: 'text'
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
  color: string
  align: 'left' | 'center' | 'right'
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape'
  shape: ShapeKind
  fill: string
  stroke: string
  strokeWidth: number
  fillEnabled: boolean
  strokeEnabled: boolean
}

export interface Stroke {
  points: { x: number; y: number }[]
  color: string
  size: number
}

export interface DrawingLayer extends BaseLayer {
  type: 'drawing'
  strokes: Stroke[]
  baseWidth: number
  baseHeight: number
}

export type Layer = ImageLayer | TextLayer | ShapeLayer | DrawingLayer

export interface EditorDocument {
  width: number
  height: number
  background: string
  layers: Layer[]
}

export interface Vec2 {
  x: number
  y: number
}
