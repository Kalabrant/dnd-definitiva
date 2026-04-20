import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

function CurrencyRow({ currency, onUpdate }) {
  const coins = [
    { key: 'cp', label: 'PC', color: 'text-amber-700' },
    { key: 'sp', label: 'PP', color: 'text-stone-500' },
    { key: 'ep', label: 'PE', color: 'text-blue-600' },
    { key: 'gp', label: 'PO', color: 'text-yellow-600' },
    { key: 'pp', label: 'PPl', color: 'text-purple-600' },
  ]
  return (
    <div className="grid grid-cols-5 gap-1">
      {coins.map(({ key, label, color }) => (
        <div key={key} className="flex flex-col items-center">
          <input type="number" value={currency[key] ?? 0} min={0}
            onChange={e => onUpdate(`currency.${key}`, parseInt(e.target.value, 10) || 0)}
            className="number-input text-sm w-full h-7 px-1" />
          <span className={`text-xs font-bold ${color}`}>{label}</span>
        </div>
      ))}
    </div>
  )
}

const TRAIT_FIELDS = [
  ['traits.personality', 'Rasgos de Personalidad'],
  ['traits.ideals', 'Ideales'],
  ['traits.bonds', 'Vínculos'],
  ['traits.flaws', 'Defectos'],
]

const APPEARANCE_FIELDS = [
  ['age', 'Edad'], ['height', 'Altura'], ['weight', 'Peso'],
  ['eyes', 'Ojos'], ['hair', 'Cabello'], ['skin', 'Piel'],
]

export function NotesPanel({ character, onUpdate }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="panel">
      <button
        className="panel-header w-full flex items-center justify-between"
        onClick={() => setCollapsed(c => !c)}
      >
        <span>Notas y Rasgos</span>
        {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {!collapsed && (
        <div className="panel-body space-y-3">
          {TRAIT_FIELDS.map(([path, label]) => (
            <div key={path}>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">{label}</label>
              <textarea
                value={path.split('.').reduce((o, k) => o?.[k], character) ?? ''}
                onChange={e => onUpdate(path, e.target.value)}
                rows={2}
                className="w-full mt-0.5 text-xs border border-stone-300 rounded p-2 bg-white/60
                           text-stone-800 placeholder-stone-400 focus:border-red-700 outline-none resize-none"
                placeholder={`Escribe tus ${label.toLowerCase()}...`}
              />
            </div>
          ))}

          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 block">
              Moneda
            </label>
            <CurrencyRow currency={character.currency} onUpdate={onUpdate} />
            <p className="text-xs text-stone-400 mt-1">PC · PP (plata) · PE · PO · PPl (platino)</p>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide">Notas libres</label>
            <textarea
              value={character.notes ?? ''}
              onChange={e => onUpdate('notes', e.target.value)}
              rows={4}
              className="w-full mt-0.5 text-xs border border-stone-300 rounded p-2 bg-white/60
                         text-stone-800 placeholder-stone-400 focus:border-red-700 outline-none resize-none"
              placeholder="Equipo, aliados, misiones pendientes..."
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 block">
              Apariencia
            </label>
            <div className="grid grid-cols-3 gap-2">
              {APPEARANCE_FIELDS.map(([field, label]) => (
                <div key={field}>
                  <label className="text-xs text-stone-400">{label}</label>
                  <input
                    value={character.appearance?.[field] ?? ''}
                    onChange={e => onUpdate(`appearance.${field}`, e.target.value)}
                    className="input-field text-xs"
                    placeholder="—"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
