import React, { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const QUICK_DICE = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100']

export function DiceRoller({ roller }) {
  const { roll, log, clearLog } = roller
  const [expression, setExpression] = useState('')
  const [bonus, setBonus] = useState(0)
  const [collapsed, setCollapsed] = useState(false)

  function handleQuick(die) {
    roll(`1${die}`, die, bonus)
  }

  function handleCustom(e) {
    e.preventDefault()
    if (!expression.trim()) return
    roll(expression.trim(), expression.trim(), bonus)
    setExpression('')
  }

  return (
    <div className="panel">
      <button
        className="panel-header w-full flex items-center justify-between"
        onClick={() => setCollapsed(c => !c)}
      >
        <span>Lanzador de Dados</span>
        {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {!collapsed && (
        <div className="panel-body space-y-3">
          {/* Dados rápidos */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_DICE.map(die => (
              <button key={die} onClick={() => handleQuick(die)}
                className="px-2 py-1 text-xs font-bold rounded border border-red-800 text-red-800
                           hover:bg-red-800 hover:text-white transition-colors bg-white/60">
                {die}
              </button>
            ))}
          </div>

          {/* Bonificador */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600">Bonus:</span>
            <input type="number" value={bonus}
              onChange={e => setBonus(parseInt(e.target.value, 10) || 0)}
              className="number-input w-16 text-sm px-1 h-7" />
          </div>

          {/* Expresión personalizada */}
          <form onSubmit={handleCustom} className="flex gap-2">
            <input value={expression} onChange={e => setExpression(e.target.value)}
              placeholder="2d6+3"
              className="input-field text-xs flex-1" />
            <button type="submit" className="dice-btn px-3">Tirar</button>
          </form>

          {/* Registro */}
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {log.length === 0 && (
              <p className="text-xs text-stone-400 text-center py-2">Sin tiradas todavía</p>
            )}
            {log.map(entry => (
              <div key={entry.id}
                className={`flex items-center justify-between text-xs rounded px-2 py-1 border
                  ${entry.isCrit ? 'bg-yellow-100 border-yellow-400' :
                    entry.isFumble ? 'bg-red-100 border-red-300' :
                    'bg-white/60 border-stone-200'}`}>
                <span className="text-stone-600 truncate max-w-[120px]" title={entry.label}>
                  {entry.label}
                  {entry.advantage && ' (ven)'}
                  {entry.disadvantage && ' (des)'}
                </span>
                <div className="flex items-center gap-2">
                  {entry.rolls?.length > 1 && (
                    <span className="text-stone-400">[{entry.rolls.join(', ')}]</span>
                  )}
                  <span className={`font-bold text-sm ${
                    entry.isCrit ? 'text-yellow-600' : entry.isFumble ? 'text-red-600' : 'text-stone-800'
                  }`}>
                    {entry.total}
                    {entry.isCrit && ' ★'}
                    {entry.isFumble && ' ✗'}
                  </span>
                  <span className="text-stone-400">{entry.ts}</span>
                </div>
              </div>
            ))}
          </div>

          {log.length > 0 && (
            <button onClick={clearLog}
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-red-700">
              <Trash2 size={12} /> Limpiar registro
            </button>
          )}
        </div>
      )}
    </div>
  )
}
