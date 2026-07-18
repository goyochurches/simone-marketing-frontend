import { DEFAULT_FILTERS, DEFAULT_TEXT_SHADOW, DEFAULT_TEXT_STROKE } from './types'
import type { EditorDocument, ImageLayer, Layer, ShapeKind, ShapeLayer, TextLayer } from './types'

function uid(): string {
  return crypto.randomUUID()
}

interface TextOpts {
  x: number
  y: number
  width: number
  height?: number
  text: string
  fontFamily: string
  fontSize: number
  fontWeight?: 'normal' | 'bold'
  fontStyle?: 'normal' | 'italic'
  color?: string
  align?: 'left' | 'center' | 'right'
}

function text(opts: TextOpts): TextLayer {
  return {
    id: uid(),
    type: 'text',
    name: 'Texto',
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height ?? opts.fontSize * 1.5,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    text: opts.text,
    fontFamily: opts.fontFamily,
    fontSize: opts.fontSize,
    fontWeight: opts.fontWeight ?? 'bold',
    fontStyle: opts.fontStyle ?? 'normal',
    color: opts.color ?? '#111827',
    align: opts.align ?? 'center',
    letterSpacing: 0,
    shadow: { ...DEFAULT_TEXT_SHADOW },
    textStroke: { ...DEFAULT_TEXT_STROKE },
  }
}

interface ShapeOpts {
  x: number
  y: number
  width: number
  height: number
  shape: ShapeKind
  fill?: string
  stroke?: string
  strokeWidth?: number
  fillEnabled?: boolean
  strokeEnabled?: boolean
}

function shape(opts: ShapeOpts): ShapeLayer {
  return {
    id: uid(),
    type: 'shape',
    name: 'Forma',
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    shape: opts.shape,
    fill: opts.fill ?? '#7c3aed',
    stroke: opts.stroke ?? '#5b21b6',
    strokeWidth: opts.strokeWidth ?? 0,
    fillEnabled: opts.fillEnabled ?? true,
    strokeEnabled: opts.strokeEnabled ?? false,
  }
}

interface ImagePlaceholderOpts {
  x: number
  y: number
  width: number
  height: number
}

function imagePlaceholder(opts: ImagePlaceholderOpts): ImageLayer {
  return {
    id: uid(),
    type: 'image',
    name: 'Imagen',
    x: opts.x,
    y: opts.y,
    width: opts.width,
    height: opts.height,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    src: '',
    flipX: false,
    flipY: false,
    filters: { ...DEFAULT_FILTERS },
  }
}

export interface Template {
  id: string
  label: string
  background?: string
  build: (width: number, height: number) => Layer[]
}

export const TEMPLATES: Template[] = [
  {
    id: 'oferta-especial',
    label: 'Oferta especial',
    build: (w, h) => [
      shape({ x: w / 2, y: h * 0.1, width: w, height: h * 0.16, shape: 'rect', fill: '#7c3aed' }),
      text({ x: w / 2, y: h * 0.1, width: w * 0.85, text: 'OFERTA ESPECIAL', fontFamily: '"Poppins", sans-serif', fontSize: h * 0.06, color: '#ffffff' }),
      imagePlaceholder({ x: w / 2, y: h * 0.5, width: w * 0.75, height: h * 0.5 }),
      text({ x: w / 2, y: h * 0.85, width: w * 0.85, text: '20% de descuento este fin de semana', fontFamily: '"Montserrat", sans-serif', fontSize: h * 0.035, fontWeight: 'normal', color: '#111827' }),
      text({ x: w / 2, y: h * 0.93, width: w * 0.7, text: 'Válido hasta agotar stock', fontFamily: 'Inter, system-ui, sans-serif', fontSize: h * 0.022, fontWeight: 'normal', color: '#64748b' }),
    ],
  },
  {
    id: 'cita-quote',
    label: 'Cita / Quote',
    background: '#faf5ff',
    build: (w, h) => [
      shape({ x: w / 2, y: h * 0.32, width: w * 0.14, height: h * 0.005, shape: 'line', stroke: '#7c3aed', strokeWidth: 6, fillEnabled: false, strokeEnabled: true }),
      text({
        x: w / 2,
        y: h / 2,
        width: w * 0.78,
        text: '"Cada detalle cuenta cuando\nse trata de tu marca"',
        fontFamily: '"Playfair Display", serif',
        fontSize: h * 0.055,
        fontWeight: 'normal',
        fontStyle: 'italic',
        color: '#1e1b2e',
      }),
      shape({ x: w / 2, y: h * 0.68, width: w * 0.14, height: h * 0.005, shape: 'line', stroke: '#7c3aed', strokeWidth: 6, fillEnabled: false, strokeEnabled: true }),
      text({ x: w / 2, y: h * 0.76, width: w * 0.7, text: '— Simone & Son', fontFamily: '"Montserrat", sans-serif', fontSize: h * 0.03, fontWeight: 'normal', color: '#7c3aed' }),
    ],
  },
  {
    id: 'anuncio-producto',
    label: 'Anuncio de producto',
    build: (w, h) => [
      imagePlaceholder({ x: w / 2, y: h * 0.36, width: w * 0.9, height: h * 0.55 }),
      shape({ x: w * 0.82, y: h * 0.66, width: w * 0.22, height: w * 0.22, shape: 'ellipse', fill: '#7c3aed' }),
      text({ x: w * 0.82, y: h * 0.66, width: w * 0.2, text: '$29', fontFamily: '"Poppins", sans-serif', fontSize: h * 0.032, color: '#ffffff' }),
      text({ x: w / 2, y: h * 0.78, width: w * 0.85, text: 'Nombre del producto', fontFamily: '"Poppins", sans-serif', fontSize: h * 0.045, color: '#111827' }),
      text({ x: w / 2, y: h * 0.9, width: w * 0.7, text: 'Comprá ahora — envío gratis', fontFamily: 'Inter, system-ui, sans-serif', fontSize: h * 0.024, fontWeight: 'normal', color: '#64748b' }),
    ],
  },
  {
    id: 'antes-despues',
    label: 'Antes / Después',
    build: (w, h) => [
      imagePlaceholder({ x: w * 0.26, y: h * 0.5, width: w * 0.46, height: h * 0.72 }),
      imagePlaceholder({ x: w * 0.74, y: h * 0.5, width: w * 0.46, height: h * 0.72 }),
      shape({ x: w / 2, y: h * 0.5, width: w * 0.008, height: h * 0.78, shape: 'rect', fill: '#ffffff' }),
      text({ x: w * 0.26, y: h * 0.13, width: w * 0.4, text: 'ANTES', fontFamily: '"Bebas Neue", sans-serif', fontSize: h * 0.05, color: '#111827' }),
      text({ x: w * 0.74, y: h * 0.13, width: w * 0.4, text: 'DESPUÉS', fontFamily: '"Bebas Neue", sans-serif', fontSize: h * 0.05, color: '#7c3aed' }),
    ],
  },
  {
    id: 'story-cta',
    label: 'Story con CTA',
    build: (w, h) => [
      text({ x: w / 2, y: h * 0.1, width: w * 0.85, text: 'Nuevo lanzamiento', fontFamily: '"Poppins", sans-serif', fontSize: h * 0.045, color: '#111827' }),
      imagePlaceholder({ x: w / 2, y: h * 0.5, width: w * 0.86, height: h * 0.55 }),
      shape({ x: w / 2, y: h * 0.88, width: w * 0.6, height: h * 0.06, shape: 'rect', fill: '#7c3aed' }),
      text({ x: w / 2, y: h * 0.88, width: w * 0.55, text: 'Desliza hacia arriba', fontFamily: '"Montserrat", sans-serif', fontSize: h * 0.024, color: '#ffffff' }),
    ],
  },
  {
    id: 'anuncio-descuento',
    label: 'Anuncio con descuento',
    background: '#111827',
    build: (w, h) => [
      shape({ x: w * 0.78, y: h * 0.22, width: w * 0.32, height: w * 0.32, shape: 'ellipse', fill: '#7c3aed' }),
      text({ x: w * 0.78, y: h * 0.22, width: w * 0.28, text: '30%\nOFF', fontFamily: '"Poppins", sans-serif', fontSize: h * 0.035, color: '#ffffff' }),
      text({ x: w * 0.4, y: h * 0.6, width: w * 0.7, text: 'Descuento por tiempo limitado', fontFamily: '"Poppins", sans-serif', fontSize: h * 0.05, color: '#ffffff', align: 'left' }),
      text({ x: w * 0.4, y: h * 0.74, width: w * 0.65, text: 'Solo por hoy en todos los productos', fontFamily: 'Inter, system-ui, sans-serif', fontSize: h * 0.026, fontWeight: 'normal', color: '#cbd5e1', align: 'left' }),
    ],
  },
]

export function applyTemplate(doc: EditorDocument, template: Template): EditorDocument {
  return { ...doc, background: template.background ?? doc.background, layers: template.build(doc.width, doc.height) }
}
