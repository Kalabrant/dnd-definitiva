import React from 'react'
import { parseTagString } from '../utils/tagParser'
import { Dice6 } from 'lucide-react'

export function RuleText({ text, onDiceRoll, onSpellClick, className = '' }) {
  if (!text || typeof text !== 'string') return null
  const tokens = parseTagString(text)

  return (
    <span className={className}>
      {tokens.map((token, i) => {
        switch (token.type) {
          case 'dice':
          case 'damage':
            return (
              <button
                key={i}
                className="dice-btn"
                onClick={() => onDiceRoll?.(token.value, token.label)}
                title={`Roll ${token.value}`}
              >
                <Dice6 size={10} />
                {token.label || token.value}
              </button>
            )
          case 'hit':
            return (
              <button
                key={i}
                className="dice-btn"
                onClick={() => onDiceRoll?.('1d20', `Attack`, token.value)}
                title={`Roll attack: 1d20+${token.value}`}
              >
                <Dice6 size={10} />
                {token.value >= 0 ? `+${token.value}` : token.value}
              </button>
            )
          case 'dc':
            return (
              <span key={i} className="font-bold text-red-800">DC {token.value}</span>
            )
          case 'spell':
            return (
              <span
                key={i}
                className="spell-link"
                onClick={() => onSpellClick?.(token.name, token.source)}
              >
                {token.display}
              </span>
            )
          case 'condition':
            return (
              <span key={i} className="condition-tag" title={token.name}>
                {token.display}
              </span>
            )
          case 'rule':
            return (
              <span key={i} className="rule-tag">{token.display}</span>
            )
          case 'bold':
            return <strong key={i}>{token.value}</strong>
          case 'italic':
            return <em key={i}>{token.value}</em>
          case 'creature':
            return <span key={i} className="font-semibold italic">{token.display}</span>
          case 'skill':
            return <span key={i} className="font-semibold text-stone-700">{token.name}</span>
          case 'item':
            return <span key={i} className="font-medium text-amber-800">{token.display}</span>
          default:
            return <span key={i}>{token.value}</span>
        }
      })}
    </span>
  )
}

export function EntryBlock({ entry, onDiceRoll, onSpellClick, depth = 0 }) {
  if (!entry) return null

  if (typeof entry === 'string') {
    return (
      <p lang="en" className={`text-sm leading-relaxed ${depth > 0 ? 'mt-1' : 'mt-2'}`}>
        <RuleText text={entry} onDiceRoll={onDiceRoll} onSpellClick={onSpellClick} />
      </p>
    )
  }

  if (typeof entry !== 'object') return null

  switch (entry.type) {
    case 'entries':
    case 'section':
      return (
        <div lang="en" className="mt-2">
          {entry.name && (
            <p className="font-bold text-sm text-stone-700 mt-2">{entry.name}</p>
          )}
          {(entry.entries || []).map((e, i) => (
            <EntryBlock key={i} entry={e} onDiceRoll={onDiceRoll} onSpellClick={onSpellClick} depth={depth + 1} />
          ))}
        </div>
      )

    case 'list':
      return (
        <ul className="mt-1 ml-4 list-disc space-y-0.5">
          {(entry.items || []).map((item, i) => (
            <li key={i} className="text-sm">
              {typeof item === 'string'
                ? <RuleText text={item} onDiceRoll={onDiceRoll} onSpellClick={onSpellClick} />
                : <EntryBlock entry={item} onDiceRoll={onDiceRoll} onSpellClick={onSpellClick} depth={depth + 1} />
              }
            </li>
          ))}
        </ul>
      )

    case 'table':
      return (
        <div className="mt-2 overflow-x-auto">
          {entry.caption && <p className="text-xs font-bold text-stone-600 mb-1">{entry.caption}</p>}
          <table className="text-xs border-collapse w-full">
            <thead>
              <tr className="bg-stone-200">
                {(entry.colLabels || []).map((col, i) => (
                  <th key={i} className="border border-stone-300 px-2 py-1 text-left font-bold">
                    <RuleText text={col} onDiceRoll={onDiceRoll} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(entry.rows || []).map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white/50' : 'bg-stone-100/50'}>
                  {(Array.isArray(row) ? row : []).map((cell, j) => (
                    <td key={j} className="border border-stone-300 px-2 py-0.5">
                      {typeof cell === 'string'
                        ? <RuleText text={cell} onDiceRoll={onDiceRoll} />
                        : typeof cell === 'object' && cell?.type === 'cell'
                          ? <RuleText text={String(cell.roll?.exact ?? cell.roll?.min ?? '')} onDiceRoll={onDiceRoll} />
                          : String(cell)
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'options':
      return (
        <div className="mt-1 ml-3 space-y-1">
          {(entry.entries || []).map((e, i) => (
            <EntryBlock key={i} entry={e} onDiceRoll={onDiceRoll} onSpellClick={onSpellClick} depth={depth + 1} />
          ))}
        </div>
      )

    case 'quote':
      return (
        <blockquote className="mt-2 pl-3 border-l-2 border-stone-400 italic text-sm text-stone-600">
          {(entry.entries || []).map((e, i) => (
            <EntryBlock key={i} entry={e} onDiceRoll={onDiceRoll} onSpellClick={onSpellClick} depth={depth + 1} />
          ))}
          {entry.by && <footer className="mt-1 text-xs not-italic">— {entry.by}</footer>}
        </blockquote>
      )

    case 'inset':
      return (
        <div className="mt-2 border border-stone-300 rounded p-2 bg-stone-100/60">
          {entry.name && <p className="font-bold text-xs text-stone-600 mb-1">{entry.name}</p>}
          {(entry.entries || []).map((e, i) => (
            <EntryBlock key={i} entry={e} onDiceRoll={onDiceRoll} onSpellClick={onSpellClick} depth={depth + 1} />
          ))}
        </div>
      )

    case 'refOptionalfeature':
      return (
        <p className="text-sm text-blue-800 ml-2">• {entry.optionalfeature?.split('|')[0]}</p>
      )

    default:
      if (entry.entries) {
        return (
          <div>
            {entry.name && <p className="font-semibold text-sm">{entry.name}</p>}
            {entry.entries.map((e, i) => (
              <EntryBlock key={i} entry={e} onDiceRoll={onDiceRoll} onSpellClick={onSpellClick} depth={depth + 1} />
            ))}
          </div>
        )
      }
      return null
  }
}
