import { AlignCenter, AlignLeft, AlignRight, Bold, FlipHorizontal, FlipVertical, Italic } from 'lucide-react'
import { DEFAULT_FILTERS, type ImageFilters, type Layer } from '../../lib/photo-editor/types'

interface PropertiesPanelProps {
  layer: Layer | null
  updateLive: (fn: (layer: Layer) => Layer) => void
  updateNow: (fn: (layer: Layer) => Layer) => void
  beginEdit: () => void
  endEdit: () => void
  onDelete: () => void
}

const FONT_OPTIONS = [
  { label: 'Inter (sans)', value: 'Inter, system-ui, sans-serif' },
  { label: 'Georgia (serif)', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Courier (mono)', value: '"Courier New", monospace' },
  { label: 'Impact', value: 'Impact, "Arial Black", sans-serif' },
]

const FILTER_PRESETS: { label: string; filters: ImageFilters }[] = [
  { label: 'Normal', filters: { ...DEFAULT_FILTERS } },
  { label: 'Blanco y negro', filters: { ...DEFAULT_FILTERS, grayscale: 100 } },
  { label: 'Vintage', filters: { ...DEFAULT_FILTERS, sepia: 60, contrast: 90, brightness: 105, saturate: 85 } },
  { label: 'Frío', filters: { ...DEFAULT_FILTERS, hueRotate: 180, saturate: 120 } },
  { label: 'Cálido', filters: { ...DEFAULT_FILTERS, sepia: 30, saturate: 130, brightness: 105 } },
  { label: 'Alto contraste', filters: { ...DEFAULT_FILTERS, contrast: 140, saturate: 110 } },
]

function toDeg(rad: number): number {
  return Math.round((rad * 180) / Math.PI)
}
function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function PropertiesPanel({ layer, updateLive, updateNow, beginEdit, endEdit, onDelete }: PropertiesPanelProps) {
  if (!layer) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs text-slate-400">Selecciona una capa para editar sus propiedades.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Propiedades — {layer.name}</div>

      <SliderField
        label="Opacidad"
        value={Math.round(layer.opacity * 100)}
        min={0}
        max={100}
        onInput={v => updateLive(l => ({ ...l, opacity: v / 100 }))}
        onBegin={beginEdit}
        onEnd={endEdit}
        suffix="%"
      />
      <SliderField
        label="Rotación"
        value={toDeg(layer.rotation)}
        min={-180}
        max={180}
        onInput={v => updateLive(l => ({ ...l, rotation: toRad(v) }))}
        onBegin={beginEdit}
        onEnd={endEdit}
        suffix="°"
      />

      {layer.type === 'image' && (
        <>
          <div className="flex gap-2">
            <button
              onClick={() => updateNow(l => (l.type === 'image' ? { ...l, flipX: !l.flipX } : l))}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <FlipHorizontal className="h-3.5 w-3.5" /> Voltear H
            </button>
            <button
              onClick={() => updateNow(l => (l.type === 'image' ? { ...l, flipY: !l.flipY } : l))}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <FlipVertical className="h-3.5 w-3.5" /> Voltear V
            </button>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Filtros rápidos</div>
            <div className="flex flex-wrap gap-1.5">
              {FILTER_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => updateNow(l => (l.type === 'image' ? { ...l, filters: { ...preset.filters } } : l))}
                  className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <SliderField label="Brillo" value={layer.filters.brightness} min={0} max={200} onInput={v => updateLive(l => (l.type === 'image' ? { ...l, filters: { ...l.filters, brightness: v } } : l))} onBegin={beginEdit} onEnd={endEdit} suffix="%" />
          <SliderField label="Contraste" value={layer.filters.contrast} min={0} max={200} onInput={v => updateLive(l => (l.type === 'image' ? { ...l, filters: { ...l.filters, contrast: v } } : l))} onBegin={beginEdit} onEnd={endEdit} suffix="%" />
          <SliderField label="Saturación" value={layer.filters.saturate} min={0} max={200} onInput={v => updateLive(l => (l.type === 'image' ? { ...l, filters: { ...l.filters, saturate: v } } : l))} onBegin={beginEdit} onEnd={endEdit} suffix="%" />
          <SliderField label="Blanco y negro" value={layer.filters.grayscale} min={0} max={100} onInput={v => updateLive(l => (l.type === 'image' ? { ...l, filters: { ...l.filters, grayscale: v } } : l))} onBegin={beginEdit} onEnd={endEdit} suffix="%" />
          <SliderField label="Sepia" value={layer.filters.sepia} min={0} max={100} onInput={v => updateLive(l => (l.type === 'image' ? { ...l, filters: { ...l.filters, sepia: v } } : l))} onBegin={beginEdit} onEnd={endEdit} suffix="%" />
          <SliderField label="Desenfoque" value={layer.filters.blur} min={0} max={20} onInput={v => updateLive(l => (l.type === 'image' ? { ...l, filters: { ...l.filters, blur: v } } : l))} onBegin={beginEdit} onEnd={endEdit} suffix="px" />
          <SliderField label="Tono" value={layer.filters.hueRotate} min={0} max={360} onInput={v => updateLive(l => (l.type === 'image' ? { ...l, filters: { ...l.filters, hueRotate: v } } : l))} onBegin={beginEdit} onEnd={endEdit} suffix="°" />
          <SliderField label="Invertir" value={layer.filters.invert} min={0} max={100} onInput={v => updateLive(l => (l.type === 'image' ? { ...l, filters: { ...l.filters, invert: v } } : l))} onBegin={beginEdit} onEnd={endEdit} suffix="%" />
        </>
      )}

      {layer.type === 'text' && (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Texto</span>
            <textarea
              value={layer.text}
              onFocus={beginEdit}
              onChange={e => updateLive(l => (l.type === 'text' ? { ...l, text: e.target.value } : l))}
              onBlur={endEdit}
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fuente</span>
            <select
              value={layer.fontFamily}
              onChange={e => updateNow(l => (l.type === 'text' ? { ...l, fontFamily: e.target.value } : l))}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            >
              {FONT_OPTIONS.map(f => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <SliderField label="Tamaño" value={layer.fontSize} min={8} max={200} onInput={v => updateLive(l => (l.type === 'text' ? { ...l, fontSize: v } : l))} onBegin={beginEdit} onEnd={endEdit} suffix="px" />

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateNow(l => (l.type === 'text' ? { ...l, fontWeight: l.fontWeight === 'bold' ? 'normal' : 'bold' } : l))}
              className={`rounded-lg border px-2.5 py-1.5 text-xs ${layer.fontWeight === 'bold' ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-600'}`}
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => updateNow(l => (l.type === 'text' ? { ...l, fontStyle: l.fontStyle === 'italic' ? 'normal' : 'italic' } : l))}
              className={`rounded-lg border px-2.5 py-1.5 text-xs ${layer.fontStyle === 'italic' ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-600'}`}
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <div className="mx-1 h-5 w-px bg-slate-200" />
            {(['left', 'center', 'right'] as const).map(align => {
              const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight
              return (
                <button
                  key={align}
                  onClick={() => updateNow(l => (l.type === 'text' ? { ...l, align } : l))}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs ${layer.align === align ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-200 text-slate-600'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              )
            })}
            <input
              type="color"
              value={layer.color}
              onPointerDown={beginEdit}
              onChange={e => updateLive(l => (l.type === 'text' ? { ...l, color: e.target.value } : l))}
              onBlur={endEdit}
              className="ml-auto h-8 w-10 cursor-pointer rounded border border-slate-200"
            />
          </div>
        </>
      )}

      {layer.type === 'shape' && (
        <>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={layer.fillEnabled}
              disabled={layer.shape === 'line'}
              onChange={e => updateNow(l => (l.type === 'shape' ? { ...l, fillEnabled: e.target.checked } : l))}
            />
            <span className="text-xs text-slate-600">Relleno</span>
            <input
              type="color"
              value={layer.fill}
              onPointerDown={beginEdit}
              onChange={e => updateLive(l => (l.type === 'shape' ? { ...l, fill: e.target.value } : l))}
              onBlur={endEdit}
              className="ml-auto h-8 w-10 cursor-pointer rounded border border-slate-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={layer.strokeEnabled}
              onChange={e => updateNow(l => (l.type === 'shape' ? { ...l, strokeEnabled: e.target.checked } : l))}
            />
            <span className="text-xs text-slate-600">Borde</span>
            <input
              type="color"
              value={layer.stroke}
              onPointerDown={beginEdit}
              onChange={e => updateLive(l => (l.type === 'shape' ? { ...l, stroke: e.target.value } : l))}
              onBlur={endEdit}
              className="ml-auto h-8 w-10 cursor-pointer rounded border border-slate-200"
            />
          </div>
          <SliderField label="Grosor de borde" value={layer.strokeWidth} min={0} max={40} onInput={v => updateLive(l => (l.type === 'shape' ? { ...l, strokeWidth: v } : l))} onBegin={beginEdit} onEnd={endEdit} suffix="px" />
        </>
      )}

      {layer.type === 'drawing' && (
        <label className="flex items-center gap-2">
          <span className="text-xs text-slate-600">Color del trazo</span>
          <input
            type="color"
            value={layer.strokes[0]?.color ?? '#111827'}
            onPointerDown={beginEdit}
            onChange={e =>
              updateLive(l => (l.type === 'drawing' ? { ...l, strokes: l.strokes.map(s => ({ ...s, color: e.target.value })) } : l))
            }
            onBlur={endEdit}
            className="ml-auto h-8 w-10 cursor-pointer rounded border border-slate-200"
          />
        </label>
      )}

      <button
        onClick={onDelete}
        className="mt-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
      >
        Eliminar capa
      </button>
    </div>
  )
}

function SliderField({
  label,
  value,
  min,
  max,
  suffix,
  onInput,
  onBegin,
  onEnd,
}: {
  label: string
  value: number
  min: number
  max: number
  suffix: string
  onInput: (v: number) => void
  onBegin: () => void
  onEnd: () => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span>{label}</span>
        <span className="font-normal normal-case text-slate-400">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onPointerDown={onBegin}
        onChange={e => onInput(Number(e.target.value))}
        onPointerUp={onEnd}
        onBlur={onEnd}
        className="w-full"
      />
    </label>
  )
}
