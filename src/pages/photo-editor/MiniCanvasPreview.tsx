import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { ensureImageLoaded, subscribeImageCache } from '../../lib/photo-editor/imageCache'
import { renderDocument } from '../../lib/photo-editor/render'
import type { EditorDocument } from '../../lib/photo-editor/types'

interface MiniCanvasPreviewProps {
  doc: EditorDocument
  className?: string
  style?: CSSProperties
}

export function MiniCanvasPreview({ doc, className, style }: MiniCanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const draw = () => renderDocument(ctx, doc)
    draw()
    for (const layer of doc.layers) {
      if (layer.type === 'image' && layer.src) ensureImageLoaded(layer.src)
    }
    return subscribeImageCache(draw)
  }, [doc])

  return <canvas ref={canvasRef} width={doc.width} height={doc.height} className={className} style={style} />
}
