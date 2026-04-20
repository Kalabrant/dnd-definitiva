// Parsea los trasfondos de 5e.tools en un formato normalizado

export function parseBackground(bg) {
  if (!bg) return null

  const is2024 = bg.source === 'XPHB' || bg.edition === 'one'
  const skills = parseSkillProfs(bg.skillProficiencies || [])
  const tools = parseToolProfs(bg.toolProficiencies || [])
  const abilityChoices = is2024 ? parse2024AbilityChoices(bg.ability || []) : null
  const feat = parseFeat(bg.feats || [])

  return {
    name: bg.name,
    source: bg.source,
    is2024,
    skills,           // ['Perspicacia', 'Religión']
    tools,            // ['Suministros de caligrafía']
    abilityChoices,   // null (2014) | { pool: ['int','wis','cha'], plusTwo: '', plusOne: '' }
    feat,
    entries: bg.entries ?? [],
  }
}

// 2024: el trasfondo da +2 a uno y +1 a otro de un conjunto
function parse2024AbilityChoices(abilityArray) {
  // Buscar la entrada con weights [2,1] → esa define el pool principal
  for (const entry of abilityArray) {
    if (entry?.choose?.weighted) {
      const { from, weights } = entry.choose.weighted
      if (weights && weights[0] === 2) {
        return { pool: from, plusTwo: '', plusOne: '' }
      }
    }
  }
  // Fallback: la primera entrada con choose
  for (const entry of abilityArray) {
    if (entry?.choose?.from) {
      return { pool: entry.choose.from, plusTwo: '', plusOne: '' }
    }
  }
  return null
}

function parseSkillProfs(profArray) {
  const skills = []
  for (const entry of profArray) {
    if (!entry) continue
    if (entry.choose) continue // elecciones libres → manual
    for (const [key, val] of Object.entries(entry)) {
      if (val === true) skills.push(normalizeSkillName(key))
    }
  }
  return skills
}

function parseToolProfs(profArray) {
  const tools = []
  for (const entry of profArray) {
    if (!entry) continue
    if (entry.choose) continue
    for (const [key, val] of Object.entries(entry)) {
      if (val === true) tools.push(key.charAt(0).toUpperCase() + key.slice(1))
    }
  }
  return tools
}

function parseFeat(featsArray) {
  if (!featsArray.length) return null
  const first = featsArray[0]
  if (!first) return null
  const key = Object.keys(first)[0]
  return key?.split(';')[0]?.split('|')[0]?.trim() ?? null
}

export function buildBackgroundIndex(bgData) {
  const all = bgData.background || []
  return {
    backgrounds2024: all.filter(b => b.source === 'XPHB'),
    backgrounds2014: all.filter(b => b.source === 'PHB' && b.edition !== 'one'),
    getByName: (name, edition) => {
      const source = edition === '2024' ? 'XPHB' : 'PHB'
      return all.find(b => b.name === name && b.source === source)
        ?? all.find(b => b.name === name)
    },
  }
}

// Convierte bonos de trasfondo en un objeto de stats
// choices = { plusTwo: 'int', plusOne: 'wis' }
export function resolveBackgroundBonuses(bgData, choices) {
  if (!bgData || !bgData.is2024 || !choices) return {}
  const bonuses = {}
  if (choices.plusTwo) bonuses[choices.plusTwo] = (bonuses[choices.plusTwo] ?? 0) + 2
  if (choices.plusOne && choices.plusOne !== choices.plusTwo) {
    bonuses[choices.plusOne] = (bonuses[choices.plusOne] ?? 0) + 1
  }
  return bonuses
}

const SKILL_NAME_MAP = {
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

function normalizeSkillName(raw) {
  return SKILL_NAME_MAP[raw.toLowerCase()] ?? (raw.charAt(0).toUpperCase() + raw.slice(1))
}
