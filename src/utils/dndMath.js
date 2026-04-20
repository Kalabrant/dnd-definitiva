export const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha']

export const ABILITY_NAMES = {
  str: 'Fuerza', dex: 'Destreza', con: 'Constitución',
  int: 'Inteligencia', wis: 'Sabiduría', cha: 'Carisma',
}

export const ABILITY_SHORT = {
  str: 'FUE', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR',
}

export const SKILLS = [
  { name: 'Acrobacias',          ability: 'dex' },
  { name: 'Trato con Animales',  ability: 'wis' },
  { name: 'Arcano',              ability: 'int' },
  { name: 'Atletismo',           ability: 'str' },
  { name: 'Engaño',              ability: 'cha' },
  { name: 'Historia',            ability: 'int' },
  { name: 'Perspicacia',         ability: 'wis' },
  { name: 'Intimidación',        ability: 'cha' },
  { name: 'Investigación',       ability: 'int' },
  { name: 'Medicina',            ability: 'wis' },
  { name: 'Naturaleza',          ability: 'int' },
  { name: 'Percepción',          ability: 'wis' },
  { name: 'Interpretación',      ability: 'cha' },
  { name: 'Persuasión',          ability: 'cha' },
  { name: 'Religión',            ability: 'int' },
  { name: 'Juego de Manos',      ability: 'dex' },
  { name: 'Sigilo',              ability: 'dex' },
  { name: 'Supervivencia',       ability: 'wis' },
]

export const SCHOOL_NAMES = {
  A: 'Abjuración', C: 'Conjuración', D: 'Adivinación',
  E: 'Encantamiento', V: 'Evocación', I: 'Ilusión',
  N: 'Nigromancia', T: 'Transmutación', P: 'Psiónico',
}

export function getModifier(score) {
  return Math.floor((score - 10) / 2)
}

export function formatMod(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

export function getProficiencyBonus(level) {
  return Math.ceil(level / 4) + 1
}

export function getSkillBonus(skillName, abilities, skillProfs, backgroundSkillProfs, level) {
  const skill = SKILLS.find(s => s.name === skillName)
  if (!skill) return 0
  const abilityMod = getModifier(abilities[skill.ability] ?? 10)
  const pb = getProficiencyBonus(level)
  const manualProf = skillProfs[skillName]
  const bgProf = (backgroundSkillProfs ?? []).includes(skillName) ? 'proficient' : null
  const effectiveProf = manualProf || bgProf
  if (effectiveProf === 'expert') return abilityMod + pb * 2
  if (effectiveProf === 'proficient') return abilityMod + pb
  return abilityMod
}

export function getSavingThrow(ability, abilities, saveProfs, level) {
  const mod = getModifier(abilities[ability] ?? 10)
  const pb = getProficiencyBonus(level)
  return saveProfs.includes(ability) ? mod + pb : mod
}

export function rollDice(expression) {
  const match = expression.match(/^(\d+)d(\d+)([+-]\d+)?$/)
  if (!match) {
    const flat = parseInt(expression, 10)
    return { rolls: [], total: isNaN(flat) ? 0 : flat, expression }
  }
  const count = parseInt(match[1], 10)
  const faces = parseInt(match[2], 10)
  const bonus = parseInt(match[3] ?? '0', 10)
  const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * faces) + 1)
  const total = rolls.reduce((a, b) => a + b, 0) + bonus
  return { rolls, total, expression, bonus }
}

export function calculateMaxHP(hdFaces, level, conMod) {
  const first = hdFaces + conMod
  const rest = (level - 1) * (Math.floor(hdFaces / 2) + 1 + conMod)
  return Math.max(1, first + rest)
}
