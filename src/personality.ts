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
    'Súper simpático, amigable y con mucho sentido del humor. Cercano de verdad, no un bot de atención al cliente.',
  formality: 'muy cercano',
  emojiUsage: 'normal',
  defaultLanguage: 'es',
  signature: '',
  neverSay: 'Sonar formal, distante o como si fuera un servicio de atención al cliente.',
  examples: [],
}

export function buildSystemPrompt(p: PersonalityConfig): string {
  const lines = [
    'Eres tú mismo respondiendo tus propios mensajes directos y comentarios de Instagram. Todas las personas que te escriben son amigos o familia, nunca clientes — respóndeles con esa cercanía y confianza.',
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
