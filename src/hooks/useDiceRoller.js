import { useState, useCallback } from 'react'
import { rollDice, formatMod } from '../utils/dndMath'

export function useDiceRoller() {
  const [log, setLog] = useState([])
  const [lastRoll, setLastRoll] = useState(null)

  const roll = useCallback((expression, label = '', bonus = 0) => {
    const expr = expression.trim()
    let result

    if (/^\d+$/.test(expr)) {
      result = { rolls: [], total: parseInt(expr, 10) + bonus, expression: expr, bonus }
    } else {
      result = rollDice(expr)
      result.total += bonus
    }

    const entry = {
      id: Date.now() + Math.random(),
      label: label || expr,
      expression: expr,
      rolls: result.rolls,
      total: result.total,
      bonus,
      ts: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isCrit: result.rolls.length === 1 && result.rolls[0] === 20,
      isFumble: result.rolls.length === 1 && result.rolls[0] === 1,
    }

    setLog(prev => [entry, ...prev].slice(0, 50))
    setLastRoll(entry)
    return entry
  }, [])

  const rollWithAdvantage = useCallback((bonus = 0, label = '') => {
    const r1 = Math.floor(Math.random() * 20) + 1
    const r2 = Math.floor(Math.random() * 20) + 1
    const chosen = Math.max(r1, r2)
    const entry = {
      id: Date.now() + Math.random(),
      label: label || 'Advantage',
      expression: '2d20kh1',
      rolls: [r1, r2],
      chosen,
      total: chosen + bonus,
      bonus,
      ts: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isCrit: chosen === 20,
      isFumble: chosen === 1,
      advantage: true,
    }
    setLog(prev => [entry, ...prev].slice(0, 50))
    setLastRoll(entry)
    return entry
  }, [])

  const rollWithDisadvantage = useCallback((bonus = 0, label = '') => {
    const r1 = Math.floor(Math.random() * 20) + 1
    const r2 = Math.floor(Math.random() * 20) + 1
    const chosen = Math.min(r1, r2)
    const entry = {
      id: Date.now() + Math.random(),
      label: label || 'Disadvantage',
      expression: '2d20kl1',
      rolls: [r1, r2],
      chosen,
      total: chosen + bonus,
      bonus,
      ts: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isCrit: chosen === 20,
      isFumble: chosen === 1,
      disadvantage: true,
    }
    setLog(prev => [entry, ...prev].slice(0, 50))
    setLastRoll(entry)
    return entry
  }, [])

  const clearLog = useCallback(() => setLog([]), [])

  return { roll, rollWithAdvantage, rollWithDisadvantage, log, lastRoll, clearLog }
}
