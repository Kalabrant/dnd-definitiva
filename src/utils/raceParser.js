// Parsea los datos de raza/especie de 5e.tools en un formato normalizado

export function parseRace(race) {
  if (!race) return null
  const abilities = parseAbilityBonuses(race.ability || [])
  const speed = typeof race.speed === 'object' ? race.speed.walk ?? 30 : race.speed ?? 30
  const skills = parseSkillProfs(race.skillProficiencies || [])
  const languages = parseLanguages(race.languageProficiencies || [])

  return {
    name: race.name,
    source: race.source,
    speed,
    size: (race.size || ['M']).join('/'),
    darkvision: race.darkvision ?? 0,
    abilities,           // { str: 2, dex: 1, ... } — fijos 2014; vacío en 2024
    hasChoiceASI: abilities._hasChoice ?? false,
    choiceASI: abilities._choice ?? null,
    skills,              // ['Perception', ...]
    languages,
    resist: race.resist ?? [],
    traits: race.entries ?? [],
    additionalSpells: race.additionalSpells ?? [],
  }
}

function parseAbilityBonuses(abilityArray) {
  const result = {}
  for (const entry of abilityArray) {
    if (!entry) continue
    if (entry.choose) {
      // Caso: {choose: {from: ['str','dex'], count: 2}} → el usuario elige
      result._hasChoice = true
      result._choice = entry.choose
    } else {
      // Caso: {str: 2, cha: 1} → bonos fijos
      for (const [key, val] of Object.entries(entry)) {
        if (['str','dex','con','int','wis','cha'].includes(key)) {
          result[key] = (result[key] ?? 0) + val
        }
      }
    }
  }
  return result
}

function parseSkillProfs(profArray) {
  const skills = []
  for (const entry of profArray) {
    if (!entry) continue
    if (entry.choose) {
      // ignorar las elecciones libres por ahora — el usuario las pone manualmente
    } else {
      for (const [key, val] of Object.entries(entry)) {
        if (val === true) {
          skills.push(normalizeSkillName(key))
        }
      }
    }
  }
  return skills
}

function parseLanguages(langArray) {
  const langs = []
  for (const entry of langArray) {
    for (const [key, val] of Object.entries(entry)) {
      if (val === true && key !== 'anyStandard' && key !== 'choose') {
        langs.push(key.charAt(0).toUpperCase() + key.slice(1))
      }
    }
  }
  return langs
}

export function buildRaceIndex(racesData) {
  const all = racesData.race || []
  return {
    races2024: all.filter(r => r.source === 'XPHB'),
    races2014: all.filter(r => ['PHB'].includes(r.source)),
    getByName: (name, edition) => {
      const source = edition === '2024' ? 'XPHB' : 'PHB'
      return all.find(r => r.name === name && r.source === source)
        ?? all.find(r => r.name === name)
    },
  }
}

function normalizeSkillName(raw) {
  const map = {
    'athletics': 'Atletismo', 'acrobatics': 'Acrobacias',
    'sleight of hand': 'Juego de Manos', 'stealth': 'Sigilo',
    'arcana': 'Arcano', 'history': 'Historia',
    'investigation': 'Investigación', 'nature': 'Naturaleza',
    'religion': 'Religión', 'animal handling': 'Trato con Animales',
    'insight': 'Perspicacia', 'medicine': 'Medicina',
    'perception': 'Percepción', 'survival': 'Supervivencia',
    'deception': 'Engaño', 'intimidation': 'Intimidación',
    'performance': 'Interpretación', 'persuasion': 'Persuasión',
  }
  return map[raw.toLowerCase()] ?? (raw.charAt(0).toUpperCase() + raw.slice(1))
}
