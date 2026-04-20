// 5e.tools tag parser — converts {@tag ...} strings into React-renderable tokens

const TAG_RE = /\{@(\w+)\s([^}]+)\}/g

export function parseTagString(str) {
  if (typeof str !== 'string') return [{ type: 'text', value: '' }]
  const tokens = []
  let lastIndex = 0
  let match

  TAG_RE.lastIndex = 0
  while ((match = TAG_RE.exec(str)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: str.slice(lastIndex, match.index) })
    }
    tokens.push(parseTag(match[1], match[2]))
    lastIndex = TAG_RE.lastIndex
  }
  if (lastIndex < str.length) {
    tokens.push({ type: 'text', value: str.slice(lastIndex) })
  }
  return tokens
}

function parseTag(tag, content) {
  const parts = content.split('|')
  switch (tag) {
    case 'dice':
    case 'damage':
      return { type: 'dice', value: parts[0].trim(), label: parts[1] || parts[0].trim() }
    case 'hit':
      return { type: 'hit', value: parseInt(parts[0], 10) }
    case 'dc':
      return { type: 'dc', value: parseInt(parts[0], 10) }
    case 'spell':
      return { type: 'spell', name: parts[0], source: parts[1] || 'XPHB', display: parts[2] || parts[0] }
    case 'condition':
      return { type: 'condition', name: parts[0], display: parts[2] || parts[0] }
    case 'variantrule':
      return { type: 'rule', name: parts[0], display: parts[2] || parts[0] }
    case 'item':
      return { type: 'item', name: parts[0], display: parts[2] || parts[0] }
    case 'filter':
      return { type: 'text', value: parts[2] || parts[0] }
    case 'class':
      return { type: 'text', value: parts[2] || parts[0] }
    case 'note':
      return { type: 'text', value: parts[0] }
    case 'b':
    case 'bold':
      return { type: 'bold', value: parts[0] }
    case 'i':
    case 'italic':
      return { type: 'italic', value: parts[0] }
    case 'creature':
      return { type: 'creature', name: parts[0], display: parts[2] || parts[0] }
    case 'skill':
      return { type: 'skill', name: parts[0] }
    case 'sense':
      return { type: 'text', value: parts[0] }
    case 'action':
      return { type: 'text', value: parts[2] || parts[0] }
    case 'quickref':
      return { type: 'text', value: parts[2] || parts[0] }
    case 'size': {
      const SIZE_ES = { F: 'Diminuta', D: 'Diminuta', T: 'Pequeña', S: 'Pequeña', M: 'Mediana', L: 'Grande', H: 'Enorme', G: 'Gargantuesca' }
      return { type: 'text', value: SIZE_ES[parts[0]] ?? parts[0] }
    }
    case 'recharge':
      return { type: 'text', value: `(Recarga ${parts[0]})` }
    case 'chance':
      return { type: 'text', value: `${parts[0]}%` }
    case 'coinflip':
      return { type: 'text', value: 'cara o cruz' }
    case 'atk':
      return { type: 'text', value: parts[0] }
    case 'scaledice':
    case 'scaledamage':
      return { type: 'dice', value: parts[2] || parts[0], label: parts[2] || parts[0] }
    case 'homestuck':
    case 'color':
    case 'highlight':
      return { type: 'text', value: parts[0] }
    default:
      return { type: 'text', value: parts[2] || parts[1] || parts[0] }
  }
}

export function renderEntriesToText(entries) {
  if (!entries) return ''
  if (typeof entries === 'string') return entries
  if (Array.isArray(entries)) return entries.map(renderEntriesToText).join('\n')
  if (typeof entries === 'object') {
    if (entries.type === 'entries' || entries.type === 'section') {
      return (entries.name ? entries.name + ': ' : '') + renderEntriesToText(entries.entries)
    }
    if (entries.type === 'list') return renderEntriesToText(entries.items)
    if (entries.type === 'table') return ''
    return ''
  }
  return ''
}
