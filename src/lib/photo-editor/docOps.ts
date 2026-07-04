import { duplicateLayer } from './factory'
import type { EditorDocument, Layer } from './types'

export function findLayer(doc: EditorDocument, id: string): Layer | undefined {
  return doc.layers.find(l => l.id === id)
}

export function updateLayer(doc: EditorDocument, id: string, fn: (layer: Layer) => Layer): EditorDocument {
  return { ...doc, layers: doc.layers.map(l => (l.id === id ? (fn(l) as typeof l) : l)) }
}

export function addLayer(doc: EditorDocument, layer: Layer): EditorDocument {
  return { ...doc, layers: [...doc.layers, layer] }
}

export function removeLayer(doc: EditorDocument, id: string): EditorDocument {
  return { ...doc, layers: doc.layers.filter(l => l.id !== id) }
}

export function duplicateLayerInDoc(doc: EditorDocument, id: string): { doc: EditorDocument; newId: string | null } {
  const layer = findLayer(doc, id)
  if (!layer) return { doc, newId: null }
  const copy = duplicateLayer(layer)
  const index = doc.layers.findIndex(l => l.id === id)
  const layers = [...doc.layers]
  layers.splice(index + 1, 0, copy)
  return { doc: { ...doc, layers }, newId: copy.id }
}

export function moveLayer(doc: EditorDocument, id: string, direction: 'up' | 'down'): EditorDocument {
  const index = doc.layers.findIndex(l => l.id === id)
  if (index === -1) return doc
  const swapWith = direction === 'up' ? index + 1 : index - 1
  if (swapWith < 0 || swapWith >= doc.layers.length) return doc
  const layers = [...doc.layers]
  ;[layers[index], layers[swapWith]] = [layers[swapWith], layers[index]]
  return { ...doc, layers }
}

export function reorderLayer(doc: EditorDocument, id: string, targetIndex: number): EditorDocument {
  const index = doc.layers.findIndex(l => l.id === id)
  if (index === -1) return doc
  const layers = [...doc.layers]
  const [item] = layers.splice(index, 1)
  const clampedIndex = Math.max(0, Math.min(targetIndex, layers.length))
  layers.splice(clampedIndex, 0, item)
  return { ...doc, layers }
}

export function cropDocument(doc: EditorDocument, rect: { x: number; y: number; width: number; height: number }): EditorDocument {
  return {
    ...doc,
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    layers: doc.layers.map(l => ({ ...l, x: l.x - rect.x, y: l.y - rect.y })),
  }
}
