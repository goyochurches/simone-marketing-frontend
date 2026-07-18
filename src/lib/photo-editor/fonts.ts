export interface FontOption {
  label: string
  value: string
}

export const FONT_OPTIONS: FontOption[] = [
  { label: 'Inter (sans)', value: 'Inter, system-ui, sans-serif' },
  { label: 'Georgia (serif)', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Courier (mono)', value: '"Courier New", monospace' },
  { label: 'Impact', value: 'Impact, "Arial Black", sans-serif' },
  { label: 'Poppins', value: '"Poppins", sans-serif' },
  { label: 'Montserrat', value: '"Montserrat", sans-serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Bebas Neue', value: '"Bebas Neue", sans-serif' },
  { label: 'Oswald', value: '"Oswald", sans-serif' },
  { label: 'Dancing Script', value: '"Dancing Script", cursive' },
]

export interface TextStylePreset {
  label: string
  fontFamily: string
  fontSize: number
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
  letterSpacing: number
}

export const TEXT_STYLE_PRESETS: TextStylePreset[] = [
  { label: 'Título', fontFamily: '"Poppins", sans-serif', fontSize: 72, fontWeight: 'bold', fontStyle: 'normal', letterSpacing: 0 },
  { label: 'Subtítulo', fontFamily: '"Montserrat", sans-serif', fontSize: 40, fontWeight: 'bold', fontStyle: 'normal', letterSpacing: 1 },
  { label: 'Cuerpo', fontFamily: 'Inter, system-ui, sans-serif', fontSize: 28, fontWeight: 'normal', fontStyle: 'normal', letterSpacing: 0 },
  { label: 'Cita', fontFamily: '"Playfair Display", serif', fontSize: 44, fontWeight: 'normal', fontStyle: 'italic', letterSpacing: 0 },
]
