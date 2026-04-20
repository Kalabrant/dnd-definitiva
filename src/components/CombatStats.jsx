import React, { useState } from 'react'
import { Heart, ChevronDown, ChevronUp } from 'lucide-react'
import { getModifier, formatMod, getProficiencyBonus } from '../utils/dndMath'

function StatCell({ label, children }) {
  return (
    <div className="flex flex-col items-center justify-center border border-stone-300 rounded-lg bg-white/70 p-2 gap-0.5">
      <span className="text-xs font-bold text-stone-500 uppercase tracking-wide text-center">{label}</span>
      {children}
    </div>
  )
}

function DotTrack({ count, filled, onToggle, colorClass = 'bg-stone-600' }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          onClick={() => onToggle(i)}
          className={`w-4 h-4 rounded-full border-2 border-stone-400 transition-colors
            ${i < filled ? `${colorClass} border-transparent` : 'bg-white'}`}
        />
      ))}
    </div>
  )
}

export function CombatStats({ character, totalAbilities, onUpdate, onUpdateHP, roller }) {
  const [damage, setDamage] = useState('')
  const [heal, setHeal] = useState('')
  const pb = getProficiencyBonus(character.level)
  const dexMod = getModifier(totalAbilities?.dex ?? character.abilities.dex ?? 10)
  const initiative = character.initiative !== null && character.initiative !== undefined
    ? character.initiative : dexMod

  const hpPercent = character.hp.max > 0
    ? Math.round((character.hp.current / character.hp.max) * 100) : 0
  const hpColor = hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'

  function apply(type) {
    const val = type === 'damage' ? damage : heal
    const n = parseInt(val, 10)
    if (!isNaN(n) && n > 0) {
      onUpdateHP(type, n)
      if (type === 'damage') setDamage(''); else setHeal('')
    }
  }

  return (
    <div className="space-y-2">
      {/* Fila principal de combate */}
      <div className="grid grid-cols-4 gap-2">
        <StatCell label="CA">
          <input type="number" value={character.ac}
            onChange={e => onUpdate('ac', parseInt(e.target.value, 10) || 10)}
            className="number-input text-xl font-bold w-12 h-8" />
        </StatCell>

        <StatCell label="Iniciativa">
          <button
            className="text-xl font-bold text-stone-800 hover:text-red-800 transition-colors"
            onClick={() => roller.roll('1d20', 'Iniciativa', initiative)}
            title="Tirar iniciativa"
          >
            {formatMod(initiative)}
          </button>
        </StatCell>

        <StatCell label="Velocidad">
          <div className="flex items-center gap-1">
            <input type="number" value={character.speed}
              onChange={e => onUpdate('speed', parseInt(e.target.value, 10) || 30)}
              className="number-input text-lg font-bold w-10 h-7" />
            <span className="text-xs text-stone-500">ft</span>
          </div>
        </StatCell>

        <StatCell label="Bono Comp.">
          <span className="text-xl font-bold text-stone-800">{formatMod(pb)}</span>
        </StatCell>
      </div>

      {/* Panel de Puntos de Golpe */}
      <div className="panel">
        <div className="panel-header flex items-center gap-2">
          <Heart size={12} /> Puntos de Golpe
        </div>
        <div className="panel-body space-y-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ['Máximos', 'max', 'text-stone-800'],
              ['Actuales', 'current', hpPercent <= 25 ? 'text-red-700' : hpPercent <= 50 ? 'text-yellow-700' : 'text-green-700'],
              ['Temporales', 'temp', 'text-blue-600'],
            ].map(([label, field, color]) => (
              <div key={field}>
                <p className="text-xs text-stone-500 mb-1">{label}</p>
                <input type="number" value={character.hp[field]}
                  onChange={e => onUpdateHP(field, parseInt(e.target.value, 10) || 0)}
                  className={`number-input text-lg font-bold w-full h-8 ${color}`} />
              </div>
            ))}
          </div>

          {/* Barra de HP */}
          <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
            <div className={`h-full ${hpColor} transition-all duration-300`} style={{ width: `${hpPercent}%` }} />
          </div>

          {/* Daño / Curar */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'damage', val: damage, setVal: setDamage, label: 'DAÑO', color: 'bg-red-700 hover:bg-red-600' },
              { type: 'heal', val: heal, setVal: setHeal, label: 'CURAR', color: 'bg-green-700 hover:bg-green-600' },
            ].map(({ type, val, setVal, label, color }) => (
              <div key={type} className="flex gap-1">
                <input type="number" value={val} min={0}
                  onChange={e => setVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && apply(type)}
                  placeholder={type === 'damage' ? 'daño' : 'curación'}
                  className="number-input text-sm w-full h-7 px-1" />
                <button onClick={() => apply(type)}
                  className={`px-2 py-1 text-xs ${color} text-white rounded font-bold transition-colors`}>
                  {label}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dados de Golpe + Tiradas de Muerte */}
      <div className="grid grid-cols-2 gap-2">
        <div className="panel">
          <div className="panel-header">Dados de Golpe</div>
          <div className="panel-body">
            <p className="text-xs text-stone-600 mb-1.5">
              d{character.hitDice.faces} · {character.hitDice.total - character.hitDice.used} restantes
            </p>
            <DotTrack
              count={character.hitDice.total}
              filled={character.hitDice.used}
              onToggle={i => onUpdate('hitDice.used', character.hitDice.used === i + 1 ? i : i + 1)}
              colorClass="bg-orange-500"
            />
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">Tiradas de Muerte</div>
          <div className="panel-body space-y-1.5">
            {[
              { key: 'successes', label: 'Éxitos', color: 'bg-green-500', textColor: 'text-green-700' },
              { key: 'failures', label: 'Fallos', color: 'bg-red-500', textColor: 'text-red-700' },
            ].map(({ key, label, color, textColor }) => (
              <div key={key} className="flex items-center gap-2">
                <span className={`text-xs font-bold ${textColor} w-12`}>{label}</span>
                <DotTrack
                  count={3}
                  filled={character.deathSaves[key]}
                  onToggle={i => onUpdate(`deathSaves.${key}`,
                    character.deathSaves[key] === i + 1 ? i : i + 1)}
                  colorClass={color}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
