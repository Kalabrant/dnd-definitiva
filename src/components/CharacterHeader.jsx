import React from 'react'
import { CLASS_LIST } from '../utils/dataLoader'
import { getProficiencyBonus } from '../utils/dndMath'
import { RaceSelector } from './RaceSelector'
import { BackgroundSelector } from './BackgroundSelector'

const ALIGNMENTS = [
  'Legal Bueno', 'Neutral Bueno', 'Caótico Bueno',
  'Legal Neutral', 'Neutral', 'Caótico Neutral',
  'Legal Malvado', 'Neutral Malvado', 'Caótico Malvado',
]

const CLASS_ES = {
  Fighter: 'Guerrero', Wizard: 'Mago', Cleric: 'Clérigo', Rogue: 'Pícaro',
  Barbarian: 'Bárbaro', Bard: 'Bardo', Druid: 'Druida', Monk: 'Monje',
  Paladin: 'Paladín', Ranger: 'Explorador', Sorcerer: 'Hechicero',
  Warlock: 'Brujo', Artificer: 'Artificiero',
}

export function CharacterHeader({ character, onUpdate, onApplyRace, onApplyBackground, onSetBackgroundASI, onDiceRoll }) {
  const pb = getProficiencyBonus(character.level)

  return (
    <div className="parchment rounded-t-lg p-4 border-b-2 border-stone-400">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">

        {/* Nombre */}
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Nombre del Personaje</label>
          <input
            value={character.name}
            onChange={e => onUpdate('name', e.target.value)}
            placeholder="Escribe un nombre..."
            className="input-field text-xl font-bold mt-0.5"
          />
        </div>

        {/* Clase */}
        <div>
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Clase</label>
          <select
            value={character.class}
            onChange={e => onUpdate('class', e.target.value)}
            className="input-field mt-0.5 cursor-pointer"
          >
            {CLASS_LIST.map(c => (
              <option key={c} value={c}>{CLASS_ES[c] ?? c}</option>
            ))}
          </select>
        </div>

        {/* Nivel */}
        <div>
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Nivel</label>
          <input
            type="number"
            min={1} max={20}
            value={character.level}
            onChange={e => onUpdate('level', Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)))}
            className="input-field text-lg font-bold mt-0.5 w-16"
          />
        </div>

        {/* Raza — selector reactivo */}
        <div className="md:col-span-2">
          <RaceSelector
            character={character}
            onApplyRace={onApplyRace}
            onDiceRoll={onDiceRoll}
          />
        </div>

        {/* Trasfondo — selector reactivo */}
        <div className="md:col-span-2">
          <BackgroundSelector
            character={character}
            onApplyBackground={onApplyBackground}
            onSetBackgroundASI={onSetBackgroundASI}
            onDiceRoll={onDiceRoll}
          />
        </div>

        {/* Alineamiento */}
        <div>
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Alineamiento</label>
          <select
            value={character.alignment}
            onChange={e => onUpdate('alignment', e.target.value)}
            className="input-field mt-0.5 cursor-pointer"
          >
            <option value="">—</option>
            {ALIGNMENTS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Toggle edición */}
        <div className="flex flex-col justify-end">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Edición</label>
          <div className="flex rounded-lg border border-stone-400 overflow-hidden w-fit">
            <button
              onClick={() => onUpdate('edition', '2024')}
              className={`px-3 py-1 text-xs font-bold transition-colors ${
                character.edition === '2024'
                  ? 'bg-red-800 text-white'
                  : 'bg-white/50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              2024
            </button>
            <button
              onClick={() => onUpdate('edition', '2014')}
              className={`px-3 py-1 text-xs font-bold transition-colors ${
                character.edition === '2014'
                  ? 'bg-stone-700 text-white'
                  : 'bg-white/50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Legacy
            </button>
          </div>
        </div>

        {/* XP + Bono + Inspiración */}
        <div className="flex items-end gap-4">
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">XP</label>
            <input
              type="number"
              value={character.xp}
              onChange={e => onUpdate('xp', parseInt(e.target.value, 10) || 0)}
              className="input-field mt-0.5 w-24"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Bono Comp.</label>
            <p className="font-bold text-stone-700 text-lg">+{pb}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Inspiración</label>
            <button
              onClick={() => onUpdate('inspiration', !character.inspiration)}
              className={`mt-0.5 w-7 h-7 rounded border-2 flex items-center justify-center font-bold text-sm transition-colors ${
                character.inspiration
                  ? 'bg-yellow-400 border-yellow-500 text-yellow-900'
                  : 'bg-white/60 border-stone-400 text-stone-300'
              }`}
            >
              ★
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
