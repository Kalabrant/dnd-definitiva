import { useState, useCallback, useEffect } from 'react'
import { getProficiencyBonus } from '../utils/dndMath'

// Dados de golpe por clase
const CLASS_HIT_DIE = {
  Barbarian: 12,
  Fighter: 10, Paladin: 10, Ranger: 10,
  Artificer: 8, Bard: 8, Cleric: 8, Druid: 8, Monk: 8, Rogue: 8, Sorcerer: 8, Warlock: 8,
  Wizard: 6,
}

const DEFAULT_CHARACTER = {
  name: '',
  playerName: '',
  class: 'Fighter',
  subclass: '',
  alignment: '',
  level: 1,
  xp: 0,
  edition: '2024',

  abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  racialBonuses: {},
  backgroundBonuses: {},

  race: '',
  raceSource: '',
  background: '',
  backgroundSource: '',
  backgroundAbilityChoices: { plusTwo: '', plusOne: '' },
  backgroundSkillProfs: [],
  _bgSkillProfs: [],
  _raceSkillProfs: [],

  savingThrowProfs: [],
  skillProfs: {},

  hp: { current: 10, max: 10, temp: 0 },
  ac: 10,
  speed: 30,
  initiative: null,

  inspiration: false,
  deathSaves: { successes: 0, failures: 0 },
  hitDice: { total: 1, used: 0, faces: 10 },

  spells: {
    usedSlots: {},
    known: [],
    prepared: [],
    spellcastingAbility: 'int',
  },

  equipment: [],
  weapons: [],
  currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
  traits: { personality: '', ideals: '', bonds: '', flaws: '' },
  notes: '',
  appearance: { age: '', height: '', weight: '', eyes: '', hair: '', skin: '' },
}

const STORAGE_KEY = 'dnd-definitiva-character'

export function useCharacter() {
  const [character, setCharacter] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return { ...DEFAULT_CHARACTER, ...JSON.parse(saved) }
    } catch {}
    return DEFAULT_CHARACTER
  })

  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(character)) } catch {}
    }, 500)
    return () => clearTimeout(t)
  }, [character])

  const update = useCallback((path, value) => {
    setCharacter(prev => {
      const next = structuredClone(prev)
      const keys = path.split('.')
      let cur = next
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]]
      cur[keys[keys.length - 1]] = value

      // Al cambiar nivel: sincronizar dados de golpe totales
      if (path === 'level') {
        const lvl = Math.max(1, Math.min(20, parseInt(value, 10) || 1))
        next.hitDice.total = lvl
        next.hitDice.used = Math.min(next.hitDice.used, lvl)
      }

      // Al cambiar clase: actualizar cara del dado de golpe y salvaciones iniciales
      if (path === 'class') {
        next.hitDice.faces = CLASS_HIT_DIE[value] ?? 8
        next.hitDice.total = next.level
      }

      return next
    })
  }, [])

  const updateAbility = useCallback((ability, value) => {
    const score = Math.max(1, Math.min(30, parseInt(value, 10) || 10))
    setCharacter(prev => ({ ...prev, abilities: { ...prev.abilities, [ability]: score } }))
  }, [])

  const toggleSaveProf = useCallback((ability) => {
    setCharacter(prev => {
      const profs = [...prev.savingThrowProfs]
      const idx = profs.indexOf(ability)
      if (idx === -1) profs.push(ability); else profs.splice(idx, 1)
      return { ...prev, savingThrowProfs: profs }
    })
  }, [])

  const cycleSkillProf = useCallback((skillName) => {
    setCharacter(prev => {
      const profs = { ...prev.skillProfs }
      const cur = profs[skillName]
      if (!cur) profs[skillName] = 'proficient'
      else if (cur === 'proficient') profs[skillName] = 'expert'
      else delete profs[skillName]
      return { ...prev, skillProfs: profs }
    })
  }, [])

  const applyRace = useCallback((parsedRace) => {
    setCharacter(prev => {
      const next = structuredClone(prev)
      next.race = parsedRace?.name ?? ''
      next.raceSource = parsedRace?.source ?? ''
      const bonuses = {}
      if (parsedRace?.abilities) {
        for (const [ab, val] of Object.entries(parsedRace.abilities)) {
          if (['str','dex','con','int','wis','cha'].includes(ab)) bonuses[ab] = val
        }
      }
      next.racialBonuses = bonuses
      if (parsedRace?.speed) next.speed = parsedRace.speed
      const raceSkills = parsedRace?.skills ?? []
      next.backgroundSkillProfs = [
        ...next.backgroundSkillProfs.filter(s => !(next._raceSkillProfs ?? []).includes(s)),
        ...raceSkills,
      ]
      next._raceSkillProfs = raceSkills
      return next
    })
  }, [])

  const applyBackground = useCallback((parsedBg) => {
    setCharacter(prev => {
      const next = structuredClone(prev)
      next.background = parsedBg?.name ?? ''
      next.backgroundSource = parsedBg?.source ?? ''
      const bgSkills = parsedBg?.skills ?? []
      const prevBgSkills = next._bgSkillProfs ?? []
      const filtered = (next.backgroundSkillProfs ?? []).filter(s => !prevBgSkills.includes(s))
      next.backgroundSkillProfs = [...filtered, ...bgSkills]
      next._bgSkillProfs = bgSkills
      next.backgroundAbilityChoices = { plusTwo: '', plusOne: '' }
      next.backgroundBonuses = {}
      return next
    })
  }, [])

  const setBackgroundASI = useCallback((plusTwo, plusOne) => {
    setCharacter(prev => {
      const bonuses = {}
      if (plusTwo) bonuses[plusTwo] = (bonuses[plusTwo] ?? 0) + 2
      if (plusOne && plusOne !== plusTwo) bonuses[plusOne] = (bonuses[plusOne] ?? 0) + 1
      return {
        ...prev,
        backgroundAbilityChoices: { plusTwo, plusOne },
        backgroundBonuses: bonuses,
      }
    })
  }, [])

  // Daño: descuenta de PG temporales primero, luego de PG actuales
  const updateHP = useCallback((field, value) => {
    setCharacter(prev => {
      const hp = { ...prev.hp }
      if (field === 'damage') {
        const dmg = Math.max(0, parseInt(value, 10) || 0)
        const tempAbsorb = Math.min(hp.temp ?? 0, dmg)
        hp.temp = (hp.temp ?? 0) - tempAbsorb
        hp.current = Math.max(0, hp.current - (dmg - tempAbsorb))
      } else if (field === 'heal') {
        hp.current = Math.min(hp.max, hp.current + (Math.max(0, parseInt(value, 10) || 0)))
      } else {
        hp[field] = parseInt(value, 10) || 0
      }
      return { ...prev, hp }
    })
  }, [])

  const toggleSpellSlot = useCallback((level, index) => {
    setCharacter(prev => {
      const usedSlots = { ...prev.spells.usedSlots }
      usedSlots[level] = [...(usedSlots[level] ?? [])]
      const idx = usedSlots[level].indexOf(index)
      if (idx === -1) usedSlots[level].push(index)
      else usedSlots[level].splice(idx, 1)
      return { ...prev, spells: { ...prev.spells, usedSlots } }
    })
  }, [])

  const toggleSpellPrepared = useCallback((spellName) => {
    setCharacter(prev => {
      const prepared = [...(prev.spells.prepared ?? [])]
      const idx = prepared.indexOf(spellName)
      if (idx === -1) prepared.push(spellName); else prepared.splice(idx, 1)
      return { ...prev, spells: { ...prev.spells, prepared } }
    })
  }, [])

  const longRest = useCallback(() => {
    setCharacter(prev => ({
      ...prev,
      hp: { ...prev.hp, current: prev.hp.max, temp: 0 },
      spells: { ...prev.spells, usedSlots: {} },
      hitDice: { ...prev.hitDice, used: 0 },
      deathSaves: { successes: 0, failures: 0 },
    }))
  }, [])

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${character.name || 'personaje'}-dnd.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [character])

  const importJSON = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result)
        setCharacter({ ...DEFAULT_CHARACTER, ...parsed })
      } catch {}
    }
    reader.readAsText(file)
  }, [])

  const resetCharacter = useCallback(() => {
    setCharacter(DEFAULT_CHARACTER)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const totalAbilities = {}
  for (const ab of ['str','dex','con','int','wis','cha']) {
    totalAbilities[ab] = (character.abilities[ab] ?? 10)
      + (character.racialBonuses?.[ab] ?? 0)
      + (character.backgroundBonuses?.[ab] ?? 0)
  }

  const pb = getProficiencyBonus(character.level)

  return {
    character, totalAbilities,
    update, updateAbility, toggleSaveProf, cycleSkillProf,
    applyRace, applyBackground, setBackgroundASI,
    updateHP, toggleSpellSlot, toggleSpellPrepared,
    longRest, exportJSON, importJSON, resetCharacter, pb,
  }
}
