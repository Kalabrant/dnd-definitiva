import React from 'react'
import { ABILITIES, ABILITY_SHORT, getModifier, formatMod, getSavingThrow } from '../utils/dndMath'

const ABILITY_ES = {
  str: 'Fuerza', dex: 'Destreza', con: 'Constitución',
  int: 'Inteligencia', wis: 'Sabiduría', cha: 'Carisma',
}

export function AbilityScores({ character, totalAbilities, onUpdate, onToggleSave, roller }) {
  function rollCheck(ability) {
    const mod = getModifier(totalAbilities[ability] ?? 10)
    roller.roll('1d20', `Prueba de ${ABILITY_ES[ability]}`, mod)
  }

  return (
    <div className="panel">
      <div className="panel-header">Características</div>
      <div className="panel-body">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {ABILITIES.map(ability => {
            const total = totalAbilities[ability] ?? 10
            const base  = character.abilities[ability] ?? 10
            const racialBonus = character.racialBonuses?.[ability] ?? 0
            const bgBonus     = character.backgroundBonuses?.[ability] ?? 0
            const totalBonus  = racialBonus + bgBonus
            const mod = getModifier(total)

            return (
              <div key={ability} className="stat-box relative group">
                <span className="stat-label">{ABILITY_SHORT[ability]}</span>

                {/* Modificador — clic para tirar */}
                <button
                  className="stat-mod hover:text-red-800 transition-colors"
                  onClick={() => rollCheck(ability)}
                  title={`Tirar prueba de ${ABILITY_ES[ability]}`}
                >
                  {formatMod(mod)}
                </button>

                {/* Input de puntuación base */}
                <input
                  type="number"
                  value={base}
                  min={1} max={30}
                  onChange={e => onUpdate(ability, e.target.value)}
                  className="stat-score"
                  title={`Puntuación base de ${ABILITY_ES[ability]}`}
                />

                {/* Badge de bono racial/trasfondo */}
                {totalBonus !== 0 && (
                  <span className={`text-xs font-bold ${totalBonus > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {totalBonus > 0 ? `+${totalBonus}` : totalBonus}
                  </span>
                )}

                {/* Tooltip desglose */}
                {totalBonus !== 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex
                                  flex-col bg-stone-800 text-white text-xs rounded px-2 py-1.5 whitespace-nowrap
                                  z-20 shadow-lg gap-0.5 pointer-events-none">
                    <span>Base: {base}</span>
                    {racialBonus !== 0 && <span>Raza: {racialBonus > 0 ? `+${racialBonus}` : racialBonus}</span>}
                    {bgBonus !== 0 && <span>Trasfondo: {bgBonus > 0 ? `+${bgBonus}` : bgBonus}</span>}
                    <span className="border-t border-stone-600 pt-0.5 font-bold">Total: {total}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-xs text-stone-400 text-center mb-3">
          Click en el modificador para tirar la prueba
        </p>

        {/* Salvaciones */}
        <div>
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Salvaciones</p>
          <div className="space-y-0.5">
            {ABILITIES.map(ability => {
              const proficient = character.savingThrowProfs.includes(ability)
              const bonus = getSavingThrow(ability, totalAbilities, character.savingThrowProfs, character.level)
              return (
                <div key={ability} className="skill-row">
                  <button
                    className={`prof-dot ${proficient ? 'proficient' : ''}`}
                    onClick={() => onToggleSave(ability)}
                    title={proficient ? 'Quitar competencia' : 'Añadir competencia'}
                  />
                  <button
                    className="flex-1 text-left text-xs text-stone-700 hover:text-red-800 flex justify-between"
                    onClick={() => roller.roll('1d20', `Salvación de ${ABILITY_ES[ability]}`, bonus)}
                  >
                    <span>{ABILITY_SHORT[ability]}</span>
                    <span className="font-bold">{formatMod(bonus)}</span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
