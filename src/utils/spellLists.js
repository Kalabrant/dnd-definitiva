// Listas de conjuros por clase según D&D 5e 2014 y 2024
// Los JSONs de 5e.tools no almacenan la relación clase→conjuro directamente,
// así que usamos los nombres canónicos de los conjuros de cada lista.

export const CASTER_INFO = {
  Fighter:   { caster: false, ability: null,  type: null,        subclassCasters: ['Eldritch Knight'] },
  Barbarian: { caster: false, ability: null,  type: null,        subclassCasters: [] },
  Monk:      { caster: false, ability: null,  type: null,        subclassCasters: [] },
  Rogue:     { caster: false, ability: null,  type: null,        subclassCasters: ['Arcane Trickster'] },
  Wizard:    { caster: true,  ability: 'int', type: 'full',      subclassCasters: [] },
  Cleric:    { caster: true,  ability: 'wis', type: 'full',      subclassCasters: [] },
  Druid:     { caster: true,  ability: 'wis', type: 'full',      subclassCasters: [] },
  Bard:      { caster: true,  ability: 'cha', type: 'full',      subclassCasters: [] },
  Sorcerer:  { caster: true,  ability: 'cha', type: 'full',      subclassCasters: [] },
  Warlock:   { caster: true,  ability: 'cha', type: 'pact',      subclassCasters: [] },
  Paladin:   { caster: true,  ability: 'cha', type: 'half',      subclassCasters: [] },
  Ranger:    { caster: true,  ability: 'wis', type: 'half',      subclassCasters: [] },
  Artificer: { caster: true,  ability: 'int', type: 'half',      subclassCasters: [] },
}

// Nombres de las listas de conjuros tal como aparecen en los JSON de PHB
// (los XPHB no tienen campo classes en los conjuros)
export const CLASS_SPELL_LIST_NAME = {
  Wizard:    'Wizard',
  Cleric:    'Cleric',
  Druid:     'Druid',
  Bard:      'Bard',
  Sorcerer:  'Sorcerer',
  Warlock:   'Warlock',
  Paladin:   'Paladin',
  Ranger:    'Ranger',
  Artificer: 'Artificer',
}

// Traducciones ES de nombres de clase
export const CLASS_ES = {
  Fighter: 'Guerrero', Wizard: 'Mago', Cleric: 'Clérigo', Rogue: 'Pícaro',
  Barbarian: 'Bárbaro', Bard: 'Bardo', Druid: 'Druida', Monk: 'Monje',
  Paladin: 'Paladín', Ranger: 'Explorador', Sorcerer: 'Hechicero',
  Warlock: 'Brujo', Artificer: 'Artificiero',
}

// Subclases que otorgan lanzamiento de conjuros
export const SUBCLASS_CASTER_LIST = {
  'Eldritch Knight': 'Wizard',   // acceso a conjuros de mago
  'Arcane Trickster': 'Wizard',  // acceso a conjuros de mago
}

// Máximo nivel de espacio según tipo de lanzador
export const MAX_SLOT_LEVEL = {
  full: 9,
  half: 5,
  pact: 5,
  third: 4,
}

export function isCaster(className) {
  return CASTER_INFO[className]?.caster ?? false
}

export function getCasterAbility(className) {
  return CASTER_INFO[className]?.ability ?? 'int'
}

// Filtra lista de conjuros por clase
// Para PHB: usa el campo classes.fromClassList
// Para XPHB: sin campo classes → devuelve todos (no hay forma de filtrar)
export function filterSpellsByClass(spells, className) {
  const listName = CLASS_SPELL_LIST_NAME[className]
  if (!listName) return []

  const filtered = spells.filter(spell => {
    const classListEntry = spell.classes?.fromClassList
    if (classListEntry) {
      return classListEntry.some(c => c.name === listName)
    }
    // XPHB spells: no tienen campo classes → los incluimos si son del mismo source
    // Heurística: si es XPHB y la clase es lanzadora, mostrar
    return spell.source === 'XPHB'
  })
  return filtered
}
