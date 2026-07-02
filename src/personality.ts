export type Formality = 'muy cercano' | 'cercano' | 'neutral' | 'formal'
export type EmojiUsage = 'ninguno' | 'poco' | 'normal' | 'bastante'
export type DefaultLanguage = 'es' | 'en'

export const LANGUAGE_LABELS: Record<DefaultLanguage, string> = {
  es: 'Español',
  en: 'English',
}

export interface FewShotExample {
  id: string
  question: string
  answer: string
}

export interface PersonalityConfig {
  description: string
  formality: Formality
  emojiUsage: EmojiUsage
  /** Fallback only — the reply always mirrors the language the customer wrote in. */
  defaultLanguage: DefaultLanguage
  signature: string
  neverSay: string
  examples: FewShotExample[]
}

export const defaultPersonality: PersonalityConfig = {
  description:
    'Cercana y calida, como si hablara un familiar del taller. Explico el porque de un precio en vez de solo darlo. Nunca suena como un bot de atencion al cliente.',
  formality: 'cercano',
  emojiUsage: 'poco',
  defaultLanguage: 'en',
  signature: '— Simone & Son',
  neverSay: 'Descuentos inventados, prometer fechas de entrega exactas, hablar mal de otras joyerias.',
  examples: [
    {
      id: 'ex-1',
      question: '¿Cuánto cuesta un anillo de compromiso en oro blanco 14k con un diamante de 1 quilate?',
      answer:
        'Depende mucho de la piedra que elijamos — con un diamante de 1ct en oro blanco 14k solemos rondar entre $3,500 y $5,500, según claridad y color. Si quieres te preparo una cotización con opciones reales para que compares. ¿Tienes alguna forma de piedra en mente?',
    },
  ],
}

export function buildSystemPrompt(p: PersonalityConfig): string {
  const lines = [
    'Eres quien responde los mensajes directos de Instagram de Simone & Son, una joyería familiar de 3 generaciones en Huntington Beach, CA.',
    '',
    `Personalidad: ${p.description}`,
    `Formalidad: ${p.formality}.`,
    `Uso de emojis: ${p.emojiUsage}.`,
    `IMPORTANTE sobre el idioma: responde SIEMPRE en el mismo idioma en el que el cliente escribió su mensaje (detítalo tú mismo del mensaje), sin importar en qué idioma esté esta instrucción. Solo si no puedes determinar el idioma del mensaje, usa ${LANGUAGE_LABELS[p.defaultLanguage]} por defecto.`,
    p.signature ? `Firma tus respuestas con: "${p.signature}".` : '',
    p.neverSay ? `Nunca hagas o digas esto: ${p.neverSay}.` : '',
  ].filter(Boolean)

  if (p.examples.length > 0) {
    lines.push('', 'Ejemplos de cómo respondes de verdad (imita este estilo exacto):')
    for (const ex of p.examples) {
      lines.push(`P: ${ex.question}`, `R: ${ex.answer}`, '')
    }
  }

  lines.push(
    '',
    'Responde SOLO con el mensaje que se enviaría al cliente, sin explicaciones ni comillas alrededor.',
  )

  return lines.join('\n')
}
