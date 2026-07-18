export interface ElementDef {
  id: string
  label: string
  /** Path data authored in a 0..100 square viewBox. */
  path: string
  category: 'arrows' | 'badges' | 'social' | 'misc'
}

export const ELEMENT_VIEWBOX = 100

export const ELEMENTS: ElementDef[] = [
  { id: 'arrow-right', label: 'Flecha derecha', category: 'arrows', path: 'M10 40 L60 40 L60 20 L90 50 L60 80 L60 60 L10 60 Z' },
  { id: 'arrow-left', label: 'Flecha izquierda', category: 'arrows', path: 'M90 40 L40 40 L40 20 L10 50 L40 80 L40 60 L90 60 Z' },
  { id: 'arrow-up', label: 'Flecha arriba', category: 'arrows', path: 'M40 90 L40 40 L20 40 L50 10 L80 40 L60 40 L60 90 Z' },
  { id: 'arrow-down', label: 'Flecha abajo', category: 'arrows', path: 'M40 10 L40 60 L20 60 L50 90 L80 60 L60 60 L60 10 Z' },
  { id: 'star', label: 'Estrella', category: 'social', path: 'M50 5 L61 35 L95 35 L68 55 L79 90 L50 70 L21 90 L32 55 L5 35 L39 35 Z' },
  { id: 'heart', label: 'Corazón', category: 'social', path: 'M50 88 C20 65 5 45 5 28 C5 12 18 2 32 2 C42 2 48 8 50 15 C52 8 58 2 68 2 C82 2 95 12 95 28 C95 45 80 65 50 88 Z' },
  { id: 'check', label: 'Check', category: 'misc', path: 'M85 20 L40 70 L15 48 L5 58 L40 90 L95 28 Z' },
  { id: 'cross', label: 'Cruz / X', category: 'misc', path: 'M20 8 L36 8 L50 34 L64 8 L80 8 L58 50 L80 92 L64 92 L50 66 L36 92 L20 92 L42 50 Z' },
  { id: 'speech-bubble', label: 'Globo de diálogo', category: 'social', path: 'M10 10 H90 A5 5 0 0 1 95 15 V65 A5 5 0 0 1 90 70 H45 L30 90 L35 70 H10 A5 5 0 0 1 5 65 V15 A5 5 0 0 1 10 10 Z' },
  {
    id: 'badge-ribbon',
    label: 'Insignia con cinta',
    category: 'badges',
    path: 'M20 50 A30 30 0 1 0 80 50 A30 30 0 1 0 20 50 Z M32 62 L18 96 L35 88 L45 98 L38 65 Z M68 62 L82 96 L65 88 L55 98 L62 65 Z',
  },
  { id: 'banner-flag', label: 'Banderín', category: 'badges', path: 'M10 15 H80 L65 50 L80 85 H10 Z' },
  {
    id: 'thumbs-up',
    label: 'Pulgar arriba',
    category: 'social',
    path: 'M15 45 H35 V95 H15 A5 5 0 0 1 10 90 V50 A5 5 0 0 1 15 45 Z M40 45 L55 10 A8 8 0 0 1 70 15 L65 45 H88 A8 8 0 0 1 95 55 L88 90 A10 10 0 0 1 78 95 H40 Z',
  },
  { id: 'location-pin', label: 'Ubicación', category: 'misc', path: 'M50 5 C25 5 10 25 10 45 C10 70 50 95 50 95 C50 95 90 70 90 45 C90 25 75 5 50 5 Z' },
  { id: 'lightning-bolt', label: 'Rayo', category: 'misc', path: 'M55 5 L15 55 H40 L30 95 L85 40 H55 Z' },
  { id: 'sparkle', label: 'Destello', category: 'misc', path: 'M50 5 C53 35 65 47 95 50 C65 53 53 65 50 95 C47 65 35 53 5 50 C35 47 47 35 50 5 Z' },
  {
    id: 'sun',
    label: 'Sol',
    category: 'misc',
    path:
      'M30 50 A20 20 0 1 0 70 50 A20 20 0 1 0 30 50 Z ' +
      'M47 5 L53 5 L53 20 L47 20 Z M47 80 L53 80 L53 95 L47 95 Z ' +
      'M5 47 L20 47 L20 53 L5 53 Z M80 47 L95 47 L95 53 L80 53 Z ' +
      'M15 15 L25 15 L25 25 L15 25 Z M75 15 L85 15 L85 25 L75 25 Z ' +
      'M15 75 L25 75 L25 85 L15 85 Z M75 75 L85 75 L85 85 L75 85 Z',
  },
  {
    id: 'quote-mark',
    label: 'Comillas',
    category: 'social',
    path:
      'M10 15 C25 15 32 28 32 42 C32 55 22 62 10 62 C10 78 20 88 35 92 L35 98 C10 95 2 78 2 58 C2 40 8 15 10 15 Z ' +
      'M55 15 C70 15 77 28 77 42 C77 55 67 62 55 62 C55 78 65 88 80 92 L80 98 C55 95 47 78 47 58 C47 40 53 15 55 15 Z',
  },
  { id: 'hexagon-badge', label: 'Insignia hexagonal', category: 'badges', path: 'M50 5 L90 27 L90 73 L50 95 L10 73 L10 27 Z' },
  { id: 'circle-badge', label: 'Insignia circular', category: 'badges', path: 'M10 50 A40 40 0 1 0 90 50 A40 40 0 1 0 10 50 Z' },
  { id: 'plus-badge', label: 'Más', category: 'badges', path: 'M40 10 H60 V40 H90 V60 H60 V90 H40 V60 H10 V40 H40 Z' },
]

export function getElement(iconId: string): ElementDef | undefined {
  return ELEMENTS.find(e => e.id === iconId)
}
