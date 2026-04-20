import React, { useState, useCallback, useRef } from 'react'
import { Download, Upload, RefreshCw, Moon, Sword } from 'lucide-react'

import { useCharacter } from './hooks/useCharacter'
import { useDiceRoller } from './hooks/useDiceRoller'

import { CharacterHeader } from './components/CharacterHeader'
import { AbilityScores } from './components/AbilityScores'
import { SkillList } from './components/SkillList'
import { CombatStats } from './components/CombatStats'
import { WeaponsPanel } from './components/WeaponsPanel'
import { DiceRoller } from './components/DiceRoller'
import { ClassFeatures } from './components/ClassFeatures'
import { Spellbook } from './components/Spellbook'
import { NotesPanel } from './components/NotesPanel'
import { SpellModal } from './components/SpellModal'

export default function App() {
  const {
    character, totalAbilities,
    update, updateAbility, toggleSaveProf, cycleSkillProf,
    applyRace, applyBackground, setBackgroundASI,
    updateHP, toggleSpellSlot, toggleSpellPrepared,
    longRest, exportJSON, importJSON, resetCharacter,
  } = useCharacter()

  const roller = useDiceRoller()
  const [spellModal, setSpellModal] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const fileRef = useRef(null)

  const handleSpellClick = useCallback((name) => {
    import('./utils/dataLoader').then(({ loadAllSpells }) => {
      loadAllSpells().then(spells => {
        const spell = spells.find(s => s.name.toLowerCase() === name.toLowerCase())
        if (spell) setSpellModal(spell)
      })
    })
  }, [])

  const handleDiceFromText = useCallback((expr, label, bonus = 0) => {
    roller.roll(expr, label, bonus)
  }, [roller])

  function handleImport(e) {
    const file = e.target.files?.[0]
    if (file) importJSON(file)
    e.target.value = ''
  }

  function handleReset() {
    if (confirmReset) {
      resetCharacter()
      setConfirmReset(false)
    } else {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-stone-900">
      {/* Barra superior */}
      <header className="bg-red-950 border-b border-red-900 px-4 py-2 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Sword size={18} className="text-red-400" />
          <span className="font-bold text-white tracking-wide text-sm">DnD Definitiva</span>
          <span className="text-red-400 text-xs hidden sm:inline">· Hoja de Personaje</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={longRest}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs text-red-200 hover:text-white hover:bg-red-800 rounded transition-colors"
            title="Descanso largo: restaura todos los PG y espacios de conjuro">
            <Moon size={12} />
            <span className="hidden sm:inline">Descanso largo</span>
          </button>
          <button onClick={exportJSON}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs bg-stone-700 text-stone-200 hover:bg-stone-600 rounded transition-colors">
            <Download size={12} />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs bg-stone-700 text-stone-200 hover:bg-stone-600 rounded transition-colors">
            <Upload size={12} />
            <span className="hidden sm:inline">Importar</span>
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button onClick={handleReset}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1 text-xs rounded transition-colors ${
              confirmReset
                ? 'bg-red-700 text-white animate-pulse'
                : 'bg-stone-700 text-stone-400 hover:bg-stone-600 hover:text-stone-200'
            }`}
            title={confirmReset ? 'Haz clic de nuevo para confirmar' : 'Reiniciar hoja'}>
            <RefreshCw size={12} />
            <span className="hidden sm:inline">{confirmReset ? '¿Confirmar?' : 'Reiniciar'}</span>
          </button>
        </div>
      </header>

      {/* Cabecera del personaje */}
      <div className="parchment shadow-lg">
        <CharacterHeader
          character={character}
          onUpdate={update}
          onApplyRace={applyRace}
          onApplyBackground={applyBackground}
          onSetBackgroundASI={setBackgroundASI}
          onDiceRoll={handleDiceFromText}
        />
      </div>

      {/* Layout principal 3 columnas */}
      <div className="max-w-screen-xl mx-auto p-3 grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Columna 1: Características + Habilidades + Dados */}
        <div className="space-y-3">
          <AbilityScores
            character={character}
            totalAbilities={totalAbilities}
            onUpdate={updateAbility}
            onToggleSave={toggleSaveProf}
            roller={roller}
          />
          <SkillList
            character={character}
            totalAbilities={totalAbilities}
            onCycleProf={cycleSkillProf}
            roller={roller}
          />
          <DiceRoller roller={roller} />
        </div>

        {/* Columna 2: Combate + Rasgos de Clase */}
        <div className="space-y-3">
          <CombatStats
            character={character}
            totalAbilities={totalAbilities}
            onUpdate={update}
            onUpdateHP={updateHP}
            roller={roller}
          />
          <WeaponsPanel 
            character={character}
            totalAbilities={totalAbilities}
            onUpdate={update}
            roller={roller}
          />
          <ClassFeatures
            character={character}
            onDiceRoll={handleDiceFromText}
            onSpellClick={handleSpellClick}
          />
        </div>

        {/* Columna 3: Grimorio + Notas */}
        <div className="space-y-3">
          <Spellbook
            character={character}
            totalAbilities={totalAbilities}
            onTogglePrepared={toggleSpellPrepared}
            onToggleSlot={toggleSpellSlot}
            roller={roller}
          />
          <NotesPanel character={character} onUpdate={update} />
        </div>
      </div>

      {/* Toast de última tirada */}
      {roller.lastRoll && (
        <div className="fixed bottom-4 right-4 z-30 pointer-events-none">
          <div className={`rounded-lg shadow-xl px-4 py-3 text-white font-bold ${
            roller.lastRoll.isCrit ? 'bg-yellow-600' :
            roller.lastRoll.isFumble ? 'bg-red-700' : 'bg-stone-800'
          }`}>
            <span className="text-white/70 text-xs mr-2">{roller.lastRoll.label}</span>
            <span className="text-2xl">{roller.lastRoll.total}</span>
            {roller.lastRoll.isCrit && <span className="text-yellow-200 ml-1 text-sm">★ ¡CRÍTICO!</span>}
            {roller.lastRoll.isFumble && <span className="text-red-200 ml-1 text-sm">✗ PIFIA</span>}
          </div>
        </div>
      )}

      {spellModal && (
        <SpellModal 
          spell={spellModal} 
          character={character}
          totalAbilities={totalAbilities}
          onClose={() => setSpellModal(null)} 
          onDiceRoll={handleDiceFromText} 
        />
      )}
    </div>
  )
}
