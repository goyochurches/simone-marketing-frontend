import type { HandleId, Layer, Vec2 } from './types'

export const MIN_SIZE = 12
export const HANDLE_HIT_RADIUS = 10
export const ROTATE_HANDLE_OFFSET = 28

export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y }
}

export function scale(a: Vec2, s: number): Vec2 {
  return { x: a.x * s, y: a.y * s }
}

/** Rotates a vector by `angle` radians (standard CCW-in-math / CW-on-screen rotation matrix). */
export function rotateVec(v: Vec2, angle: number): Vec2 {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos }
}

export function layerCenter(layer: Layer): Vec2 {
  return { x: layer.x, y: layer.y }
}

/** Converts a canvas-space point into the layer's local, unrotated coordinate frame (origin at layer center). */
export function toLocal(point: Vec2, layer: Layer): Vec2 {
  const rel = sub(point, layerCenter(layer))
  return rotateVec(rel, -layer.rotation)
}

export function hitTestLayer(point: Vec2, layer: Layer): boolean {
  const local = toLocal(point, layer)
  return Math.abs(local.x) <= layer.width / 2 && Math.abs(local.y) <= layer.height / 2
}

const HANDLE_LOCAL_OFFSET: Record<Exclude<HandleId, 'rotate'>, (w: number, h: number) => Vec2> = {
  nw: (w, h) => ({ x: -w / 2, y: -h / 2 }),
  n: (_w, h) => ({ x: 0, y: -h / 2 }),
  ne: (w, h) => ({ x: w / 2, y: -h / 2 }),
  e: (w, _h) => ({ x: w / 2, y: 0 }),
  se: (w, h) => ({ x: w / 2, y: h / 2 }),
  s: (_w, h) => ({ x: 0, y: h / 2 }),
  sw: (w, h) => ({ x: -w / 2, y: h / 2 }),
  w: (w, _h) => ({ x: -w / 2, y: 0 }),
}

const OPPOSITE_HANDLE: Record<Exclude<HandleId, 'rotate'>, Exclude<HandleId, 'rotate'>> = {
  nw: 'se',
  n: 's',
  ne: 'sw',
  e: 'w',
  se: 'nw',
  s: 'n',
  sw: 'ne',
  w: 'e',
}

const FREE_AXES: Record<Exclude<HandleId, 'rotate'>, { x: boolean; y: boolean }> = {
  nw: { x: true, y: true },
  n: { x: false, y: true },
  ne: { x: true, y: true },
  e: { x: true, y: false },
  se: { x: true, y: true },
  s: { x: false, y: true },
  sw: { x: true, y: true },
  w: { x: true, y: false },
}

export function getHandlePositions(layer: Layer): Partial<Record<HandleId, Vec2>> {
  const positions: Partial<Record<HandleId, Vec2>> = {}
  const center = layerCenter(layer)
  for (const id of Object.keys(HANDLE_LOCAL_OFFSET) as Exclude<HandleId, 'rotate'>[]) {
    const local = HANDLE_LOCAL_OFFSET[id](layer.width, layer.height)
    positions[id] = add(center, rotateVec(local, layer.rotation))
  }
  const topLocal = { x: 0, y: -layer.height / 2 - ROTATE_HANDLE_OFFSET }
  positions.rotate = add(center, rotateVec(topLocal, layer.rotation))
  return positions
}

export function findHandleAt(point: Vec2, layer: Layer): HandleId | null {
  const positions = getHandlePositions(layer)
  for (const id of Object.keys(positions) as HandleId[]) {
    const pos = positions[id]
    if (!pos) continue
    const d = Math.hypot(point.x - pos.x, point.y - pos.y)
    if (d <= HANDLE_HIT_RADIUS) return id
  }
  return null
}

export interface ResizeStart {
  handle: Exclude<HandleId, 'rotate'>
  centerCanvas: Vec2
  width: number
  height: number
  rotation: number
}

export function beginResize(layer: Layer, handle: Exclude<HandleId, 'rotate'>): ResizeStart {
  return { handle, centerCanvas: layerCenter(layer), width: layer.width, height: layer.height, rotation: layer.rotation }
}

export function computeResize(start: ResizeStart, mouseCanvas: Vec2): { x: number; y: number; width: number; height: number } {
  const anchorHandle = OPPOSITE_HANDLE[start.handle]
  const anchorLocal = HANDLE_LOCAL_OFFSET[anchorHandle](start.width, start.height)
  const anchorCanvas = add(start.centerCanvas, rotateVec(anchorLocal, start.rotation))
  const vCanvas = sub(mouseCanvas, anchorCanvas)
  const vLocal = rotateVec(vCanvas, -start.rotation)
  const free = FREE_AXES[start.handle]

  const newWidth = free.x ? Math.max(MIN_SIZE, Math.abs(vLocal.x)) : start.width
  const newHeight = free.y ? Math.max(MIN_SIZE, Math.abs(vLocal.y)) : start.height
  const centerOffsetLocal = { x: free.x ? vLocal.x / 2 : 0, y: free.y ? vLocal.y / 2 : 0 }
  const newCenter = add(anchorCanvas, rotateVec(centerOffsetLocal, start.rotation))

  return { x: newCenter.x, y: newCenter.y, width: newWidth, height: newHeight }
}

export function angleBetween(center: Vec2, point: Vec2): number {
  return Math.atan2(point.y - center.y, point.x - center.x)
}

export function boundsOfPoints(points: Vec2[]): { x: number; y: number; width: number; height: number } {
  const xs = points.map(p => p.x)
  const ys = points.map(p => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) }
}
