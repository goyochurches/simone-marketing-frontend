export interface PendingComment {
  id: string
  from: string
  handle: string
  comment: string
  receivedAt: string
  post: {
    productName: string
    caption: string
    /** Hue for the placeholder thumbnail — stands in for the real post image until Instagram is connected. */
    color: string
  }
}

export const mockPendingComments: PendingComment[] = [
  {
    id: 'cm-1',
    from: 'Laura G.',
    handle: '@laura.g',
    comment: '¡Precioso! ¿Cuánto vale?',
    receivedAt: '2026-07-01T10:15:00',
    post: {
      productName: 'Anillo halo oro blanco 14k',
      caption: 'Diamante central 0.9ct rodeado de halo — para quienes quieren que la piedra hable sola. 💍',
      color: '#7c3aed',
    },
  },
  {
    id: 'cm-2',
    from: 'Kevin S.',
    handle: '@kev.s',
    comment: 'Is this available in a men’s size?',
    receivedAt: '2026-07-01T13:40:00',
    post: {
      productName: 'Cadena cubana oro amarillo 18k',
      caption: 'Grosor 6mm, acabado espejo. Hecha para durar generaciones. ⛓️',
      color: '#b45309',
    },
  },
  {
    id: 'cm-3',
    from: 'Priya N.',
    handle: '@priya.n',
    comment: 'Do you do this in rose gold too?',
    receivedAt: '2026-07-02T08:05:00',
    post: {
      productName: 'Pendientes gota zafiro',
      caption: 'Zafiro azul 1.2ct total, montura oro blanco. Edición limitada de temporada.',
      color: '#0f766e',
    },
  },
]
