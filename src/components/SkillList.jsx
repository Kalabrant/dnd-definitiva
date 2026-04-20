import React from 'react'
import { SKILLS, getSkillBonus, formatMod } from '../utils/dndMath'

const ABILITY_SHORT_ES = { str: 'FUE', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' }

export function SkillList({ character, totalAbilities, onCycleProf, roller }) {
  const bgSkills = character.backgroundSkillProfs ?? []

  return (
    <div className="panel">
      <div className="panel-header">Habilidades</div>
      <div className="panel-body p-2">
        <div className="space-y-0.5">
          {SKILLS.map(skill => {
            const manualProf = character.skillProfs[skill.name]
            const fromBg = bgSkills.includes(skill.name)
            const effectiveProf = manualProf || (fromBg ? 'proficient' : null)
            const bonus = getSkillBonus(
              skill.name, totalAbilities, character.skillProfs, bgSkills, character.level
            )

            return (
              <div key={skill.name} className="skill-row">
                <button
                  className={`prof-dot ${effectiveProf ?? ''}`}
                  onClick={() => onCycleProf(skill.name)}
                  title={
                    fromBg && !manualProf
                      ? 'Del trasfondo (click para añadir manualmente)'
                      : !effectiveProf ? 'Click: sin comp → comp → maestría'
                      : effectiveProf === 'proficient' ? 'Click para maestría'
                      : 'Click para quitar'
                  }
                  style={fromBg && !manualProf ? { outline: '2px solid #d97706', outlineOffset: '1px' } : {}}
                />
                <button
                  className="flex-1 text-left flex justify-between items-center"
                  onClick={() => roller.roll('1d20', skill.name, bonus)}
                >
                  <span className={`text-xs ${effectiveProf ? 'font-semibold text-stone-800' : 'text-stone-600'}`}>
                    {skill.name}
                    <span className="text-stone-400 font-normal ml-1">
                      ({ABILITY_SHORT_ES[skill.ability]})
                    </span>
                    {fromBg && !manualProf && (
                      <span className="ml-1 text-amber-600 text-xs" title="Del trasfondo">◆</span>
                    )}
                  </span>
                  <span className={`text-xs font-bold ml-2 ${
                    effectiveProf === 'expert' ? 'text-amber-700' :
                    effectiveProf ? 'text-stone-700' : 'text-stone-500'
                  }`}>
                    {formatMod(bonus)}
                  </span>
                </button>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-stone-400 mt-2 text-center leading-relaxed">
          Click punto: sin comp → comp → maestría<br />
          <span className="text-amber-600">◆</span> = del trasfondo
        </p>
      </div>
    </div>
  )
}
