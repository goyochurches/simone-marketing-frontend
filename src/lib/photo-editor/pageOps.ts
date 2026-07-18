import { createEmptyDocument } from './factory'
import type { EditorDocument, Layer } from './types'

function id(): string {
  return crypto.randomUUID()
}

export function addPage(pages: EditorDocument[], page: EditorDocument, atIndex?: number): EditorDocument[] {
  const next = [...pages]
  const index = atIndex ?? next.length
  next.splice(index, 0, page)
  return next
}

export function duplicatePage(pages: EditorDocument[], pageId: string): { pages: EditorDocument[]; newId: string | null } {
  const index = pages.findIndex(p => p.id === pageId)
  if (index === -1) return { pages, newId: null }
  const copy: EditorDocument = { ...pages[index], id: id(), layers: pages[index].layers.map(l => ({ ...l, id: id() }) as Layer) }
  const next = [...pages]
  next.splice(index + 1, 0, copy)
  return { pages: next, newId: copy.id }
}

export function removePage(pages: EditorDocument[], pageId: string): EditorDocument[] {
  if (pages.length <= 1) return pages
  return pages.filter(p => p.id !== pageId)
}

export function reorderPage(pages: EditorDocument[], pageId: string, direction: 'left' | 'right'): EditorDocument[] {
  const index = pages.findIndex(p => p.id === pageId)
  if (index === -1) return pages
  const swapWith = direction === 'left' ? index - 1 : index + 1
  if (swapWith < 0 || swapWith >= pages.length) return pages
  const next = [...pages]
  ;[next[index], next[swapWith]] = [next[swapWith], next[index]]
  return next
}

export function resizeAllPages(pages: EditorDocument[], width: number, height: number): EditorDocument[] {
  return pages.map(p => ({ ...p, width, height }))
}

export function createBlankPage(width: number, height: number): EditorDocument {
  return createEmptyDocument(width, height)
}
