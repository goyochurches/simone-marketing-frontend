export type SourceQuality = 'measured' | 'estimated'

export interface CompetitorAccount {
  handle: string
  name: string
  location: string
  isUs: boolean
  followers: number
  posts: number | null
  followersPerPost: number | null
  format: string
  note: string
  comparable: boolean
  sourceQuality: SourceQuality
}

export const lastUpdated = '2026-07-02'

export const accounts: CompetitorAccount[] = [
  {
    handle: '@simoneandson',
    name: 'Simone & Son',
    location: 'Huntington Beach, CA',
    isUs: true,
    followers: 13000,
    posts: 2193,
    followersPerPost: 5.9,
    format: 'Fotos de producto, catálogo',
    note: 'Historia familiar de 3 generaciones (desde 1978) — hoy no se ve reflejada en el contenido.',
    comparable: true,
    sourceQuality: 'measured',
  },
  {
    handle: '@parkerj.pj',
    name: 'Parker J — Permanent Jewelry & Charm Bar',
    location: 'Huntington Beach, CA',
    isUs: false,
    followers: 33000,
    posts: 600,
    followersPerPost: 55,
    format: 'Reels del proceso en vivo, eventos y pop-ups',
    note: 'Casi 3x tus seguidores con menos de un tercio de tus posts. Mismo código postal.',
    comparable: true,
    sourceQuality: 'measured',
  },
  {
    handle: '@marothjewels',
    name: 'Maroth Jewels',
    location: 'India / USA (mayorista)',
    isUs: false,
    followers: 12000,
    posts: null,
    followersPerPost: null,
    format: 'Fabricante mayorista oro/plata (B2B)',
    note: 'Modelo de negocio distinto (venta a comercios, no al público) — referencia, no competencia directa.',
    comparable: false,
    sourceQuality: 'estimated',
  },
  {
    handle: '@winstonscrownjewelers',
    name: "Winston's Crown Jewelers",
    location: 'Newport Beach, CA',
    isUs: false,
    followers: 2085,
    posts: null,
    followersPerPost: null,
    format: 'Presencia modesta',
    note: 'Familiar desde 1969 — misma narrativa de negocio de generaciones, menor actividad en Instagram.',
    comparable: true,
    sourceQuality: 'estimated',
  },
  {
    handle: '@affinityjewelers',
    name: 'Affinity & Co Jewelers',
    location: 'Huntington Beach, CA',
    isUs: false,
    followers: 958,
    posts: 2067,
    followersPerPost: 0.46,
    format: 'Alto volumen de fotos de catálogo',
    note: 'Casi el mismo volumen de posts que tú, pero con la tracción más baja del grupo.',
    comparable: true,
    sourceQuality: 'measured',
  },
  {
    handle: '@CRDiamondJewelers',
    name: 'C&R Diamond Jewelers',
    location: 'Huntington Beach, CA',
    isUs: false,
    followers: 75,
    posts: 72,
    followersPerPost: 1.04,
    format: 'Cuenta pequeña, apenas activa',
    note: 'Volumen bajo, sin señales claras de estrategia.',
    comparable: true,
    sourceQuality: 'measured',
  },
]

export interface Recommendation {
  title: string
  detail: string
}

export const recommendations: Recommendation[] = [
  {
    title: 'Subir la proporción de reels vs. fotos',
    detail:
      '@parkerj.pj gana con video del proceso en vivo (la pieza soldándose en la muñeca), no con catálogo estático. Con 2,193 posts ya tenemos volumen de sobra — el hueco está en el formato, no en la cantidad.',
  },
  {
    title: 'Explotar la historia de 3 generaciones en video',
    detail:
      'El diferencial real frente a todos los competidores de la zona es la trayectoria familiar desde 1978. Hoy vive en el "about", no en el contenido — series cortas de "detrás del taller" la ponen al frente.',
  },
  {
    title: 'Probar formato evento / pop-up',
    detail:
      'Parker J y su modelo de pop-ups es lo que más está empujando su crecimiento en la misma zona. No hace falta copiar el producto (permanent jewelry), sí el formato: eventos en vivo grabados y publicados.',
  },
]
