const BASE = import.meta.env.BASE_URL + 'data'
const cache = {}

async function loadJSON(path) {
  if (cache[path]) return cache[path]
  const res = await fetch(`${BASE}/${path}`)
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`)
  const data = await res.json()
  cache[path] = data
  return data
}

export async function loadClass(className) {
  const key = className.toLowerCase()
  const data = await loadJSON(`class/class-${key}.json`)
  return {
    class2024: data.class?.find(c => c.source === 'XPHB') || null,
    class2014: data.class?.find(c => c.source === 'PHB') || null,
    features: data.classFeature || [],
    subclasses: data.subclass || [],
    subclassFeatures: data.subclassFeature || [],
  }
}

export async function loadSpells(source = 'xphb') {
  const data = await loadJSON(`spells/spells-${source}.json`)
  return data.spell || []
}

export async function loadAllSpells() {
  const [xphb, phb] = await Promise.all([
    loadSpells('xphb'),
    loadSpells('phb'),
  ])
  return [...xphb, ...phb]
}

export async function loadRaces() {
  const data = await loadJSON('races.json')
  return {
    races2024: (data.race || []).filter(r => r.source === 'XPHB'),
    races2014: (data.race || []).filter(r => ['PHB', 'VGM', 'MPMM', 'MTHOF'].includes(r.source)),
    subraces: data.subrace || [],
  }
}

export async function loadBackgrounds() {
  const data = await loadJSON('backgrounds.json')
  const all = data.background || []
  return {
    backgrounds2024: all.filter(b => b.source === 'XPHB' || b.edition === 'one'),
    backgrounds2014: all.filter(b => b.source === 'PHB' && b.edition !== 'one'),
    all,
  }
}

export async function loadFeats() {
  const data = await loadJSON('feats.json')
  const all = data.feat || []
  return {
    feats2024: all.filter(f => f.source === 'XPHB'),
    feats2014: all.filter(f => f.source === 'PHB'),
    all,
  }
}

export const CLASS_LIST = [
  'Artificer', 'Barbarian', 'Bard', 'Cleric', 'Druid',
  'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue',
  'Sorcerer', 'Warlock', 'Wizard',
]
