import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, BookOpen, ChevronDown, ChevronUp, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { loadAllSpells } from '../utils/dataLoader'
import { SCHOOL_NAMES, getModifier, formatMod, getProficiencyBonus } from '../utils/dndMath'
import { isCaster, getCasterAbility, CLASS_ES, filterSpellsByClass, CASTER_INFO } from '../utils/spellLists'
import { SpellModal } from './SpellModal'
import { translateSpellName } from '../utils/spellNames'

const LEVEL_ES = ['Trucos', '1.º', '2.º', '3.º', '4.º', '5.º', '6.º', '7.º', '8.º', '9.º']
const PAGE_SIZE = 40

// Índice 0 = nivel 1 de espacios, índice 8 = nivel 9
const SLOT_TABLE = {
  1: [2,0,0,0,0,0,0,0,0],  2: [3,0,0,0,0,0,0,0,0],  3: [4,2,0,0,0,0,0,0,0],
  4: [4,3,0,0,0,0,0,0,0],  5: [4,3,2,0,0,0,0,0,0],  6: [4,3,3,0,0,0,0,0,0],
  7: [4,3,3,1,0,0,0,0,0],  8: [4,3,3,2,0,0,0,0,0],  9: [4,3,3,3,1,0,0,0,0],
  10:[4,3,3,3,2,0,0,0,0], 11:[4,3,3,3,2,1,0,0,0], 12:[4,3,3,3,2,1,0,0,0],
  13:[4,3,3,3,2,1,1,0,0], 14:[4,3,3,3,2,1,1,0,0], 15:[4,3,3,3,2,1,1,1,0],
  16:[4,3,3,3,2,1,1,1,0], 17:[4,3,3,3,2,1,1,1,1], 18:[4,3,3,3,3,1,1,1,1],
  19:[4,3,3,3,3,2,1,1,1], 20:[4,3,3,3,3,2,2,1,1],
}

const PACT_SLOTS = {
  1: [1,0,0,0,0], 2: [2,0,0,0,0], 3: [0,2,0,0,0], 4: [0,2,0,0,0],
  5: [0,0,2,0,0], 6: [0,0,2,0,0], 7: [0,0,0,2,0], 8: [0,0,0,2,0],
  9: [0,0,0,0,2],10: [0,0,0,0,2],11: [0,0,0,0,3],12: [0,0,0,0,3],
  13:[0,0,0,0,3],14: [0,0,0,0,3],15: [0,0,0,0,3],16: [0,0,0,0,3],
  17:[0,0,0,0,4],18: [0,0,0,0,4],19: [0,0,0,0,4],20: [0,0,0,0,4],
}

const HALF_SLOT_TABLE = {
  1: [0,0,0,0,0,0,0,0,0], 2: [2,0,0,0,0,0,0,0,0], 3: [3,0,0,0,0,0,0,0,0],
  4: [3,0,0,0,0,0,0,0,0], 5: [4,2,0,0,0,0,0,0,0], 6: [4,2,0,0,0,0,0,0,0],
  7: [4,3,0,0,0,0,0,0,0], 8: [4,3,0,0,0,0,0,0,0], 9: [4,3,2,0,0,0,0,0,0],
  10:[4,3,2,0,0,0,0,0,0],11:[4,3,3,0,0,0,0,0,0],12:[4,3,3,0,0,0,0,0,0],
  13:[4,3,3,1,0,0,0,0,0],14:[4,3,3,1,0,0,0,0,0],15:[4,3,3,2,0,0,0,0,0],
  16:[4,3,3,2,0,0,0,0,0],17:[4,3,3,3,1,0,0,0,0],18:[4,3,3,3,1,0,0,0,0],
  19:[4,3,3,3,2,0,0,0,0],20:[4,3,3,3,2,0,0,0,0],
}

function getSlotTable(className) {
  const info = CASTER_INFO[className]
  if (!info?.caster) return null
  if (info.type === 'pact') return PACT_SLOTS
  if (info.type === 'half') return HALF_SLOT_TABLE
  return SLOT_TABLE
}

function SpellSlots({ level, spellState, onToggle, className }) {
  const table = getSlotTable(className)
  if (!table) return null
  const slots = table[Math.max(1, Math.min(20, level))] ?? []
  const isPact = CASTER_INFO[className]?.type === 'pact'
  const hasAnySlot = slots.some(c => c > 0)
  if (!hasAnySlot) return (
    <p className="text-xs text-stone-400 italic mb-2">
      Sin espacios de conjuro a nivel {level}
      {CASTER_INFO[className]?.type === 'half' ? ' (lanzador de medio nivel)' : ''}.
    </p>
  )

  return (
    <div className="space-y-1 mb-3">
      <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
        {isPact ? 'Espacios de Pacto' : 'Espacios de Conjuro'}
      </p>
      {slots.map((count, i) => {
        if (count === 0) return null          // ← CORREGIDO: ya NO se salta i===0
        const slotLevel = i + 1              // índice 0 = nivel 1, índice 1 = nivel 2…
        const used = spellState.usedSlots?.[slotLevel] ?? []
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-stone-600 w-8 font-medium">{LEVEL_ES[slotLevel]}</span>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: count }, (_, j) => (
                <button key={j} onClick={() => onToggle(slotLevel, j)}
                  className={`w-5 h-5 rounded-full border-2 transition-colors ${
                    used.includes(j)
                      ? 'bg-stone-300 border-stone-300'
                      : 'bg-purple-600 border-purple-700 hover:bg-purple-500'
                  }`}
                  title={used.includes(j) ? `Espacio ${LEVEL_ES[slotLevel]} (usado)` : `Espacio ${LEVEL_ES[slotLevel]} (disponible)`}
                />
              ))}
            </div>
            <span className="text-xs text-stone-400">{count - used.length}/{count}</span>
          </div>
        )
      })}
    </div>
  )
}

export function Spellbook({ character, totalAbilities, onTogglePrepared, onToggleSlot, roller }) {
  const [allSpells, setAllSpells] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filterLevel, setFilterLevel] = useState(-1)
  const [showAll, setShowAll] = useState(false)
  const [page, setPage] = useState(0)
  const [selectedSpell, setSelectedSpell] = useState(null)
  const [activeTab, setActiveTab] = useState('browser')
  const [collapsed, setCollapsed] = useState(false)

  const className = character.class
  const classInfo = CASTER_INFO[className]
  const isSpellcaster = classInfo?.caster ?? false
  const subclassCasters = classInfo?.subclassCasters ?? []

  useEffect(() => {
    loadAllSpells().then(setAllSpells).catch(console.error).finally(() => setLoading(false))
  }, [])

  // Reset página al cambiar filtros
  useEffect(() => { setPage(0) }, [query, filterLevel, showAll, className])

  const classSpells = useMemo(() => {
    if (!allSpells.length) return []
    if (showAll) return allSpells
    return filterSpellsByClass(allSpells, className)
  }, [allSpells, className, showAll])

  const filteredAll = useMemo(() => {
    let list = classSpells
    if (filterLevel >= 0) list = list.filter(s => s.level === filterLevel)
    if (query) {
      const q = query.toLowerCase()
      list = list.filter(s => s.name.toLowerCase().includes(q))
    }
    return list
  }, [classSpells, query, filterLevel])

  const totalPages = Math.ceil(filteredAll.length / PAGE_SIZE)
  const filtered = filteredAll.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleDiceRoll = useCallback((expr, label, bonus = 0) => {
    roller.roll(expr, label, bonus)
  }, [roller])

  const spellAbilityKey = character.spells?.spellcastingAbility || getCasterAbility(className) || 'int'
  const abilityMod = getModifier(totalAbilities?.[spellAbilityKey] ?? character.abilities[spellAbilityKey] ?? 10)
  const pb = getProficiencyBonus(character.level)
  const spellAttack = formatMod(abilityMod + pb)
  const saveDC = 8 + abilityMod + pb

  return (
    <div className="panel">
      <button className="panel-header w-full flex items-center justify-between"
        onClick={() => setCollapsed(c => !c)}>
        <span className="flex items-center gap-2"><BookOpen size={12} /> Grimorio</span>
        {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {!collapsed && (
        <div className="panel-body space-y-3">

          {/* Aviso si la clase no lanza conjuros */}
          {!isSpellcaster && (
            <div className="rounded-lg bg-amber-100 border border-amber-300 p-3 space-y-1">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <AlertCircle size={14} />
                {CLASS_ES[className] ?? className} no es lanzador de conjuros
              </div>
              {subclassCasters.length > 0 && (
                <p className="text-xs text-amber-700">
                  Subclases con magia: <strong>{subclassCasters.join(', ')}</strong>
                </p>
              )}
              <button onClick={() => { setShowAll(true) }}
                className="text-xs text-amber-800 underline hover:text-red-800">
                Ver catálogo completo de conjuros →
              </button>
            </div>
          )}

          {/* Stats de conjuración */}
          {isSpellcaster && (
            <div className="grid grid-cols-3 gap-2 text-center">
              {[['Ataque', spellAttack], ['CD', String(saveDC)], ['Caract.', spellAbilityKey.toUpperCase()]].map(([l, v]) => (
                <div key={l} className="border border-stone-200 rounded bg-white/60 p-1.5">
                  <p className="text-xs text-stone-500">{l}</p>
                  <p className="font-bold text-stone-800">{v}</p>
                </div>
              ))}
            </div>
          )}

          {/* Espacios de conjuro */}
          {isSpellcaster && (
            <SpellSlots level={character.level} spellState={character.spells ?? { usedSlots: {} }}
              onToggle={onToggleSlot} className={className} />
          )}

          {/* Pestañas */}
          <div className="flex border-b border-stone-300">
            {[['browser','Buscar conjuros'],['prepared',`Preparados (${character.spells?.prepared?.length ?? 0})`]].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`px-3 py-1.5 text-xs font-bold transition-colors border-b-2 ${
                  activeTab === id ? 'border-red-800 text-red-800' : 'border-transparent text-stone-500 hover:text-stone-700'
                }`}>{label}</button>
            ))}
          </div>

          {activeTab === 'browser' && (
            <>
              {/* Filtros */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input value={query} onChange={e => setQuery(e.target.value)}
                    placeholder="Buscar conjuro..."
                    className="w-full pl-6 pr-2 py-1 text-xs border border-stone-300 rounded bg-white/60
                               text-stone-800 outline-none focus:border-red-700" />
                </div>
                <select value={filterLevel} onChange={e => setFilterLevel(parseInt(e.target.value, 10))}
                  className="text-xs border border-stone-300 rounded px-1 py-1 bg-white/60 text-stone-700 outline-none">
                  <option value={-1}>Todos</option>
                  {LEVEL_ES.map((l, i) => <option key={i} value={i}>{l}</option>)}
                </select>
              </div>

              {/* Toggle lista de clase / todos */}
              {isSpellcaster && (
                <div className="flex items-center justify-between">
                  <button onClick={() => setShowAll(v => !v)}
                    className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                      showAll ? 'bg-stone-600 text-white border-stone-600'
                              : 'bg-white/60 text-stone-600 border-stone-300 hover:border-stone-400'
                    }`}>
                    {showAll ? '✓ Todos los conjuros' : `Solo lista de ${CLASS_ES[className] ?? className}`}
                  </button>
                  <span className="text-xs text-stone-400">{filteredAll.length} conjuros</span>
                </div>
              )}

              {/* Lista paginada */}
              <div className="space-y-0.5 max-h-72 overflow-y-auto">
                {loading && <p className="text-xs text-stone-400 text-center py-4">Cargando conjuros...</p>}
                {!loading && filteredAll.length === 0 && (
                  <p className="text-xs text-stone-400 text-center py-4">Sin resultados</p>
                )}
                {filtered.map(spell => {
                  const isPrepared = character.spells?.prepared?.includes(spell.name)
                  return (
                    <div key={`${spell.name}-${spell.source}`}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-stone-100 transition-colors">
                      <button onClick={() => onTogglePrepared(spell.name)}
                        className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center text-xs ${
                          isPrepared ? 'bg-purple-600 border-purple-600 text-white' : 'border-stone-400 hover:border-purple-400'
                        }`} title={isPrepared ? 'Quitar' : 'Preparar'}>
                        {isPrepared && '✓'}
                      </button>
                      <button className="flex-1 text-left text-xs text-stone-700 hover:text-red-800 font-medium truncate"
                        onClick={() => setSelectedSpell(spell)}>
                        {translateSpellName(spell.name)}
                      </button>
                      <span className="text-xs text-stone-400 flex-shrink-0">
                        {spell.level === 0 ? 'T' : spell.level}·{SCHOOL_NAMES[spell.school]?.slice(0,3) ?? spell.school}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-1 border-t border-stone-200">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="flex items-center gap-1 text-xs text-stone-600 hover:text-red-800 disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronLeft size={12} /> Anterior
                  </button>
                  <span className="text-xs text-stone-500">
                    {page + 1} / {totalPages}
                    <span className="text-stone-400 ml-1">({filteredAll.length} total)</span>
                  </span>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                    className="flex items-center gap-1 text-xs text-stone-600 hover:text-red-800 disabled:opacity-30 disabled:cursor-not-allowed">
                    Siguiente <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'prepared' && (
            <div className="space-y-0.5 max-h-80 overflow-y-auto">
              {!character.spells?.prepared?.length && (
                <p className="text-xs text-stone-400 text-center py-4">Ningún conjuro preparado</p>
              )}
              {(character.spells?.prepared ?? []).map(name => {
                const spell = allSpells.find(s => s.name === name)
                return (
                  <div key={name} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-stone-100">
                    <button onClick={() => onTogglePrepared(name)}
                      className="w-4 h-4 rounded border bg-purple-600 border-purple-600 text-white flex items-center justify-center text-xs">✓</button>
                    <button className="flex-1 text-left text-xs text-stone-700 hover:text-red-800 font-medium truncate"
                      onClick={() => spell && setSelectedSpell(spell)}>{name}</button>
                    {spell && <span className="text-xs text-stone-400">{spell.level === 0 ? 'T' : spell.level}</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {selectedSpell && (
        <SpellModal spell={selectedSpell} onClose={() => setSelectedSpell(null)} onDiceRoll={handleDiceRoll} />
      )}
    </div>
  )
}
