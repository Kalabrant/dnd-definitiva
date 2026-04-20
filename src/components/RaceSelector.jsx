import React, { useState, useEffect, useRef } from 'react'
import { ChevronDown, X, Eye, Zap } from 'lucide-react'
import { loadRaces } from '../utils/dataLoader'
import { parseRace } from '../utils/raceParser'
import { EntryBlock } from './RuleText'
import { ABILITY_SHORT } from '../utils/dndMath'

const SIZE_ES = { M: 'Mediana', S: 'Pequeña', L: 'Grande', 'S/M': 'Pequeña/Mediana' }

export function RaceSelector({ character, onApplyRace, onDiceRoll }) {
  const [raceIndex, setRaceIndex] = useState(null)
  const [open, setOpen] = useState(false)
  const [detailRace, setDetailRace] = useState(null)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    loadRaces().then(data => setRaceIndex(data))
  }, [])

  // Cerrar al clic fuera
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const edition = character.edition
  const races = raceIndex
    ? (edition === '2024' ? raceIndex.races2024 : raceIndex.races2014)
    : []

  const filtered = races.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleSelect(race) {
    const parsed = parseRace(race)
    onApplyRace(parsed)
    setOpen(false)
    setSearch('')
  }

  function openDetail(race, e) {
    e.stopPropagation()
    setDetailRace(parseRace(race))
  }

  const currentRaw = raceIndex
    ? races.find(r => r.name === character.race)
    : null

  return (
    <div ref={ref} className="relative">
      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
        {edition === '2024' ? 'Especie' : 'Raza'}
      </label>
      <button
        onClick={() => setOpen(o => !o)}
        className="input-field mt-0.5 flex items-center justify-between w-full text-left"
      >
        <span className={character.race ? 'text-stone-800' : 'text-stone-400'}>
          {character.race || 'Seleccionar...'}
        </span>
        <ChevronDown size={14} className="text-stone-400 flex-shrink-0" />
      </button>

      {/* Resumen de bonos bajo el selector */}
      {character.race && (
        <div className="flex flex-wrap gap-1 mt-1">
          {Object.entries(character.racialBonuses || {}).map(([ab, val]) => (
            <span key={ab} className="text-xs bg-emerald-100 text-emerald-800 rounded px-1.5 py-0.5 font-bold">
              {ABILITY_SHORT[ab]} {val > 0 ? `+${val}` : val}
            </span>
          ))}
          {currentRaw?.speed && currentRaw.speed !== 30 && (
            <span className="text-xs bg-blue-100 text-blue-800 rounded px-1.5 py-0.5 font-bold">
              Vel {currentRaw.speed}ft
            </span>
          )}
          {currentRaw?.darkvision > 0 && (
            <span className="text-xs bg-purple-100 text-purple-800 rounded px-1.5 py-0.5 font-bold">
              Visión oscura {currentRaw.darkvision}ft
            </span>
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
              placeholder="Buscar raza..."
              className="w-full text-xs border border-stone-300 rounded px-2 py-1.5 bg-white
                         text-stone-800 outline-none focus:border-red-700"
            />
          </div>
          <div className="overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-xs text-stone-400 text-center py-4">Sin resultados</p>
            )}
            {filtered.map(race => {
              const parsed = parseRace(race)
              const hasBonuses = Object.keys(parsed.abilities).filter(k =>
                ['str','dex','con','int','wis','cha'].includes(k)
              ).length > 0
              const isSelected = race.name === character.race

              return (
                <button
                  key={`${race.name}-${race.source}`}
                  className={`w-full text-left px-3 py-2 hover:bg-stone-100 flex items-center justify-between
                             ${isSelected ? 'bg-red-50 text-red-800 font-semibold' : 'text-stone-700'}`}
                  onClick={() => handleSelect(race)}
                >
                  <div>
                    <span className="text-sm">{race.name}</span>
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      {hasBonuses && Object.entries(parsed.abilities)
                        .filter(([k]) => ['str','dex','con','int','wis','cha'].includes(k))
                        .map(([ab, val]) => (
                          <span key={ab} className="text-xs text-emerald-700 font-bold">
                            {ABILITY_SHORT[ab]} +{val}
                          </span>
                        ))
                      }
                      {parsed.hasChoiceASI && (
                        <span className="text-xs text-blue-700">+1 a elegir</span>
                      )}
                      {parsed.speed !== 30 && (
                        <span className="text-xs text-stone-500">Vel {parsed.speed}ft</span>
                      )}
                      {parsed.darkvision > 0 && (
                        <span className="text-xs text-purple-700">Visión oscura</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={e => openDetail(race, e)}
                    className="ml-2 p-1 rounded text-stone-400 hover:text-red-800 hover:bg-red-50 flex-shrink-0"
                    title="Ver rasgos"
                  >
                    <Eye size={14} />
                  </button>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal de detalles de raza */}
      {detailRace && (
        <RaceDetailModal race={detailRace} onClose={() => setDetailRace(null)} onDiceRoll={onDiceRoll} />
      )}
    </div>
  )
}

function RaceDetailModal({ race, onClose, onDiceRoll }) {
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
            <h2 className="text-lg font-bold">{race.name}</h2>
            <p className="text-red-200 text-xs mt-0.5">{race.source}</p>
          </div>
          <button onClick={onClose} className="text-red-300 hover:text-white ml-4">
            <X size={18} />
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-3 gap-px bg-stone-200">
          {[
            ['Talla', SIZE_ES[race.size] ?? race.size],
            ['Velocidad', `${race.speed} ft`],
            ['Visión oscura', race.darkvision > 0 ? `${race.darkvision} ft` : '—'],
          ].map(([label, val]) => (
            <div key={label} className="bg-amber-50 px-3 py-2 text-center">
              <p className="text-xs text-stone-500 font-bold">{label}</p>
              <p className="text-sm font-semibold text-stone-800">{val}</p>
            </div>
          ))}
        </div>

        {/* Bonos de stats */}
        {Object.keys(race.abilities).filter(k => ['str','dex','con','int','wis','cha'].includes(k)).length > 0 && (
          <div className="px-4 pt-3">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">
              Mejoras de Puntuación de Característica
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(race.abilities)
                .filter(([k]) => ['str','dex','con','int','wis','cha'].includes(k))
                .map(([ab, val]) => (
                  <span key={ab} className="bg-emerald-100 text-emerald-800 text-sm font-bold px-2 py-1 rounded">
                    {ABILITY_SHORT[ab]} +{val}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Rasgos */}
        <div className="px-4 py-3">
          {race.traits.map((entry, i) => (
            <EntryBlock key={i} entry={entry} onDiceRoll={onDiceRoll} />
          ))}
        </div>
      </div>
    </div>
  )
}
