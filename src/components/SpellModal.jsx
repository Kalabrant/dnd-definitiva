import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { EntryBlock } from './RuleText'
import { SCHOOL_NAMES } from '../utils/dndMath'
import { translateSpellName } from '../utils/spellNames'

function formatTime(time) {
  if (!time?.[0]) return '—'
  const t = time[0]
  const units = { action: 'Acción', bonus: 'Acción Adicional', reaction: 'Reacción',
                  minute: 'minuto', hour: 'hora', round: 'ronda' }
  const u = units[t.unit] ?? t.unit
  return `${t.number} ${u}${t.condition ? ` (${t.condition})` : ''}`
}

function formatRange(range) {
  if (!range) return '—'
  if (range.type === 'special') return 'Especial'
  if (range.type === 'point') {
    const d = range.distance
    if (d?.type === 'self') return 'Uno mismo'
    if (d?.type === 'touch') return 'Toque'
    if (d?.type === 'sight') return 'Línea de visión'
    if (d?.type === 'unlimited') return 'Ilimitado'
    return `${d?.amount ?? ''} ft`.trim()
  }
  return '—'
}

function formatDuration(duration) {
  if (!duration?.[0]) return '—'
  const d = duration[0]
  if (d.type === 'instant') return 'Instantánea'
  if (d.type === 'permanent') return 'Hasta ser disipado'
  if (d.type === 'special') return 'Especial'
  if (d.duration) {
    const units = { round: 'ronda', minute: 'minuto', hour: 'hora', day: 'día' }
    const u = units[d.duration.type] ?? d.duration.type
    const conc = d.concentration ? 'Concentración, hasta ' : ''
    return `${conc}${d.duration.amount} ${u}${d.duration.amount > 1 ? 's' : ''}`
  }
  return '—'
}

function formatComponents(components) {
  if (!components) return '—'
  const parts = []
  if (components.v) parts.push('V')
  if (components.s) parts.push('S')
  if (components.m) {
    const mat = typeof components.m === 'string' ? components.m : components.m?.text ?? ''
    parts.push(`M (${mat})`)
  }
  return parts.join(', ') || '—'
}

const LEVEL_ES = ['Truco', '1.º', '2.º', '3.º', '4.º', '5.º', '6.º', '7.º', '8.º', '9.º']

export function SpellModal({ spell, onClose, onDiceRoll }) {
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  if (!spell) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-amber-50 text-stone-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-red-900 text-white p-4 rounded-t-lg flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{translateSpellName(spell.name)}</h2>
            <p className="text-red-200 text-sm mt-0.5">
              {spell.level === 0 ? 'Truco' : `Nivel ${spell.level}`}
              {' · '}{SCHOOL_NAMES[spell.school] ?? spell.school}
              {' · '}<span className="text-red-300">{spell.source}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-red-200 hover:text-white ml-4"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-2 gap-px bg-stone-200 border-b border-stone-200">
          {[
            ['Tiempo de conjuración', formatTime(spell.time)],
            ['Alcance', formatRange(spell.range)],
            ['Componentes', formatComponents(spell.components)],
            ['Duración', formatDuration(spell.duration)],
          ].map(([label, value]) => (
            <div key={label} className="bg-amber-50 px-4 py-2">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">{label}</p>
              <p className="text-sm text-stone-800 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        <div className="p-4" lang="en">
          {(spell.entries ?? []).map((entry, i) => (
            <EntryBlock key={i} entry={entry} onDiceRoll={onDiceRoll} />
          ))}
          {spell.entriesHigherLevel && (
            <div className="mt-4 pt-3 border-t border-stone-200">
              <p className="font-bold text-sm text-stone-700" lang="es">A niveles superiores</p>
              {spell.entriesHigherLevel.map((entry, i) => (
                <EntryBlock key={i} entry={entry} onDiceRoll={onDiceRoll} />
              ))}
            </div>
          )}
          {spell.classes?.fromClassList && (
            <div className="mt-4 pt-3 border-t border-stone-200">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">Clases</p>
              <p className="text-sm text-stone-700 mt-1">
                {spell.classes.fromClassList.map(c => c.name).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
