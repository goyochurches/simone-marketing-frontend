export interface PendingDm {
  id: string
  from: string
  handle: string
  message: string
  receivedAt: string
}

export const mockPendingDms: PendingDm[] = [
  {
    id: 'dm-1',
    from: 'Jessica R.',
    handle: '@jess.rvra',
    message: '¡Hola! Vi el anillo de compromiso que publicaron ayer, ¿tienen disponible en talla 6? ¿Y cuánto costaría?',
    receivedAt: '2026-06-30T14:12:00',
  },
  {
    id: 'dm-2',
    from: 'Marcus T.',
    handle: '@marcus.t',
    message: 'Buenas, ¿hacen diseños custom? Quiero algo con la piedra de nacimiento de mi hija.',
    receivedAt: '2026-06-30T16:45:00',
  },
  {
    id: 'dm-3',
    from: 'Ana P.',
    handle: '@anap_oc',
    message: '¿Tienen tienda física o solo venden por Instagram? Estoy en Huntington Beach.',
    receivedAt: '2026-07-01T09:03:00',
  },
  {
    id: 'dm-4',
    from: 'Diego M.',
    handle: '@diego.moreno',
    message: 'Necesito arreglar el broche de un collar de mi abuela, ¿hacen reparaciones?',
    receivedAt: '2026-07-01T11:27:00',
  },
]
