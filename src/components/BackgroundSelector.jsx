import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, X, Eye } from 'lucide-react'
import { loadBackgrounds } from '../utils/dataLoader'
import { parseBackground } from '../utils/backgroundParser'
import { EntryBlock } from './RuleText'
import { ABILITY_SHORT, ABILITIES } from '../utils/dndMath'

export function BackgroundSelector({ character, onApplyBackground, onSetBackgroundASI, onDiceRoll }) {
  const [bgIndex, setBgIndex] = useState(null)
  const [open, setOpen] = useState(false)
  const [detailBg, setDetailBg] = useState(null)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    loadBackgrounds().then(data => setBgIndex(data))
  }, [])

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const edition = character.edition
  const bgs = bgIndex
    ? (edition === '2024' ? bgIndex.backgrounds2024 : bgIndex.backgrounds2014)
    : []

  const filtered = bgs.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleSelect(bg) {
    const parsed = parseBackground(bg)
    onApplyBackground(parsed)
    setOpen(false)
    setSearch('')
  }

  function openDetail(bg, e) {
    e.stopPropagation()
    setDetailBg(parseBackground(bg))
  }

  const currentBg = bgIndex
    ? bgs.find(b => b.name === character.background)
    : null
  const parsedCurrentBg = currentBg ? parseBackground(currentBg) : null

  const choices = character.backgroundAbilityChoices ?? { plusTwo: '', plusOne: '' }
  const pool = parsedCurrentBg?.abilityChoices?.pool ?? []

  return (
    <div ref={ref} className="relative">
      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
        Trasfondo
      </label>
      <button
        onClick={() => setOpen(o => !o)}
        className="input-field mt-0.5 flex items-center justify-between w-full text-left"
      >
        <span className={character.background ? 'text-stone-800' : 'text-stone-400'}>
          {character.background || 'Seleccionar...'}
        </span>
        <ChevronDown size={14} className="text-stone-400 flex-shrink-0" />
      </button>

      {/* Habilidades del trasfondo */}
      {parsedCurrentBg?.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          <span className="text-xs text-stone-500">Habilidades:</span>
          {parsedCurrentBg.skills.map(s => (
            <span key={s} className="text-xs bg-amber-100 text-amber-800 rounded px-1.5 py-0.5 font-bold">{s}</span>
          ))}
        </div>
      )}

      {/* Selector ASI para trasfondos 2024 */}
      {edition === '2024' && parsedCurrentBg?.abilityChoices && pool.length > 0 && (
        <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-xs font-bold text-emerald-800 mb-2">
            Mejora de Característica
            <span className="font-normal text-emerald-600 ml-1">
              (elige de {pool.map(a => ABILITY_SHORT[a]).join(', ')})
            </span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-emerald-700 font-semibold">+2 a</label>
              <select
                value={choices.plusTwo}
                onChange={e => onSetBackgroundASI(e.target.value, choices.plusOne)}
                className="w-full mt-0.5 text-xs border border-emerald-300 rounded px-2 py-1
                           bg-white text-stone-800 outline-none focus:border-red-700"
              >
                <option value="">— elegir —</option>
                {pool.map(ab => (
                  <option key={ab} value={ab} disabled={ab === choices.plusOne}>
                    {ABILITY_SHORT[ab]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-emerald-700 font-semibold">+1 a</label>
              <select
                value={choices.plusOne}
                onChange={e => onSetBackgroundASI(choices.plusTwo, e.target.value)}
                className="w-full mt-0.5 text-xs border border-emerald-300 rounded px-2 py-1
                           bg-white text-stone-800 outline-none focus:border-red-700"
              >
                <option value="">— elegir —</option>
                {pool.map(ab => (
                  <option key={ab} value={ab} disabled={ab === choices.plusTwo}>
                    {ABILITY_SHORT[ab]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview de bonos */}
          {(choices.plusTwo || choices.plusOne) && (
            <div className="flex gap-1 mt-2">
              {choices.plusTwo && (
                <span className="text-xs bg-emerald-200 text-emerald-900 rounded px-2 py-0.5 font-bold">
                  {ABILITY_SHORT[choices.plusTwo]} +2
                </span>
              )}
              {choices.plusOne && choices.plusOne !== choices.plusTwo && (
                <span className="text-xs bg-emerald-200 text-emerald-900 rounded px-2 py-0.5 font-bold">
                  {ABILITY_SHORT[choices.plusOne]} +1
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 bg-amber-50 border border-stone-300
                        rounded-lg shadow-xl mt-1 max-h-72 flex flex-col">
          <div className="p-2 border-b border-stone-200">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar trasfondo..."
              className="w-full text-xs border border-stone-300 rounded px-2 py-1.5 bg-white
                         text-stone-800 outline-none focus:border-red-700"
            />
          </div>
          <div className="overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-xs text-stone-400 text-center py-4">Sin resultados</p>
            )}
            {filtered.map(bg => {
              const parsed = parseBackground(bg)
              const isSelected = bg.name === character.background
              return (
                <button
                  key={`${bg.name}-${bg.source}`}
                  className={`w-full text-left px-3 py-2 hover:bg-stone-100 flex items-center justify-between
                             ${isSelected ? 'bg-red-50 text-red-800 font-semibold' : 'text-stone-700'}`}
                  onClick={() => handleSelect(bg)}
                >
                  <div>
                    <span className="text-sm">{bg.name}</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {parsed.skills.map(s => (
                        <span key={s} className="text-xs text-amber-700">{s}</span>
                      ))}
                      {parsed.abilityChoices && (
                        <span className="text-xs text-emerald-700">
                          +2/+1 ({parsed.abilityChoices.pool.map(a => ABILITY_SHORT[a]).join('/')})
                        </span>
                      )}
                      {parsed.feat && (
                        <span className="text-xs text-blue-700">Dote: {parsed.feat}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={e => openDetail(bg, e)}
                    className="ml-2 p-1 rounded text-stone-400 hover:text-red-800 hover:bg-red-50 flex-shrink-0"
                    title="Ver descripción"
                  >
                    <Eye size={14} />
                  </button>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {detailBg && (
        <BackgroundDetailModal bg={detailBg} onClose={() => setDetailBg(null)} onDiceRoll={onDiceRoll} />
      )}
    </div>
  )
}

function BackgroundDetailModal({ bg, onClose, onDiceRoll }) {
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-amber-50 rounded-lg shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
        <div className="bg-red-900 text-white p-4 rounded-t-lg flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">{bg.name}</h2>
            <p className="text-red-200 text-xs">{bg.source} · {bg.is2024 ? '2024' : '2014'}</p>
          </div>
          <button onClick={onClose} className="text-red-300 hover:text-white ml-4"><X size={18} /></button>
        </div>

        <div className="p-4 space-y-3">
          {bg.skills.length > 0 && (
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Habilidades</p>
              <div className="flex flex-wrap gap-1">
                {bg.skills.map(s => (
                  <span key={s} className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded">{s}</span>
                ))}
              </div>
            </div>
          )}

          {bg.abilityChoices && (
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
                Mejora de Característica
              </p>
              <p className="text-sm text-stone-700">
                +2 a una y +1 a otra de:{' '}
                <strong>{bg.abilityChoices.pool.map(a => ABILITY_SHORT[a]).join(', ')}</strong>
              </p>
            </div>
          )}

          {bg.tools.length > 0 && (
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
                Herramientas
              </p>
              <p className="text-sm text-stone-700">{bg.tools.join(', ')}</p>
            </div>
          )}

          {bg.feat && (
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Dote</p>
              <p className="text-sm font-semibold text-stone-800">{bg.feat}</p>
            </div>
          )}

          {bg.entries.map((entry, i) => (
            <EntryBlock key={i} entry={entry} onDiceRoll={onDiceRoll} />
          ))}
        </div>
      </div>
    </div>
  )
}
