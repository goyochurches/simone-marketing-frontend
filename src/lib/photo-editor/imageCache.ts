type Listener = () => void

const cache = new Map<string, HTMLImageElement>()
const pending = new Set<string>()
const listeners = new Set<Listener>()

export function getCachedImage(src: string): HTMLImageElement | undefined {
  return cache.get(src)
}

export function ensureImageLoaded(src: string): void {
  if (!src || cache.has(src) || pending.has(src)) return
  pending.add(src)
  const img = new Image()
  img.onload = () => {
    cache.set(src, img)
    pending.delete(src)
    notify()
  }
  img.onerror = () => {
    pending.delete(src)
  }
  img.src = src
}

export function subscribeImageCache(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function notify(): void {
  listeners.forEach(fn => fn())
}
