import React, { useState } from 'react'
import { Crosshair, Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { getModifier, formatMod, getProficiencyBonus } from '../utils/dndMath'

const STAT_OPTIONS = {
  str: 'Fuerza',
  dex: 'Destreza',
  con: 'Constitución',
  int: 'Inteligencia',
  wis: 'Sabiduría',
  cha: 'Carisma',
  finesse: 'Sutil (Fuerza/Destreza)'
}

export function WeaponsPanel({ character, totalAbilities, onUpdate, roller }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const pb = getProficiencyBonus(character.level)

  const defaultWeapon = {
    id: '',
    name: '',
    stat: 'str',
    isProficient: true,
    magicBonus: 0,
    damageDice: '1d8',
    damageType: 'Cortante'
  }

  const [formData, setFormData] = useState(defaultWeapon)

  const weapons = character.weapons || []

  function getStatMod(statKey) {
    if (statKey === 'finesse') {
      const str = getModifier(totalAbilities?.str ?? character.abilities.str ?? 10)
      const dex = getModifier(totalAbilities?.dex ?? character.abilities.dex ?? 10)
      return Math.max(str, dex)
    }
    const score = totalAbilities?.[statKey] ?? character.abilities[statKey] ?? 10
    return getModifier(score)
  }

  function handleSaveWeapon() {
    if (!formData.name.trim()) return

    if (editingId) {
      onUpdate('weapons', weapons.map(w => w.id === editingId ? { ...formData } : w))
    } else {
      const newWeapon = { ...formData, id: Date.now().toString() }
      onUpdate('weapons', [...weapons, newWeapon])
    }
    resetForm()
  }

  function handleDelete(id) {
    onUpdate('weapons', weapons.filter(w => w.id !== id))
  }

  function resetForm() {
    setIsAdding(false)
    setEditingId(null)
    setFormData(defaultWeapon)
  }

  function editWeapon(weapon) {
    setFormData({ ...weapon })
    setEditingId(weapon.id)
    setIsAdding(true)
  }

  function rollAttack(weapon) {
    const statMod = getStatMod(weapon.stat)
    const attackBonus = (weapon.isProficient ? pb : 0) + statMod + (parseInt(weapon.magicBonus) || 0)
    roller.roll('1d20', `Ataque: ${weapon.name}`, attackBonus)
  }

  function rollDamage(weapon) {
    const statMod = getStatMod(weapon.stat)
    const dmgBonus = statMod + (parseInt(weapon.magicBonus) || 0)
    roller.roll(weapon.damageDice, `Daño: ${weapon.name}`, dmgBonus)
  }

  return (
    <div className="panel">
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair size={12} /> Armas y Ataques
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} 
            className="flex items-center gap-1 text-xs text-white bg-red-800 hover:bg-red-700 px-2 py-0.5 rounded transition-colors">
            <Plus size={10} /> Añadir
          </button>
        )}
      </div>

      <div className="panel-body space-y-2">
        {/* Lista de armas */}
        {weapons.length === 0 && !isAdding && (
          <p className="text-xs text-stone-500 italic text-center py-2">No tienes armas añadidas.</p>
        )}

        <div className="space-y-2">
          {weapons.map(weapon => {
            if (isAdding && editingId === weapon.id) return null // Hide if currently editing
            
            const statMod = getStatMod(weapon.stat)
            const attackBonus = (weapon.isProficient ? pb : 0) + statMod + (parseInt(weapon.magicBonus) || 0)
            const dmgBonus = statMod + (parseInt(weapon.magicBonus) || 0)
            
            const atkString = formatMod(attackBonus)
            const dmgString = `${weapon.damageDice}${dmgBonus !== 0 ? formatMod(dmgBonus) : ''}`
            
            return (
              <div key={weapon.id} className="relative group border border-stone-200 bg-stone-50 rounded p-2 flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-stone-800 flex items-center gap-1">
                    {weapon.name}
                    {parseInt(weapon.magicBonus) > 0 && <span className="text-xs text-blue-600">+{weapon.magicBonus}</span>}
                  </span>
                  
                  <div className="flex bg-stone-200 rounded text-stone-500 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => editWeapon(weapon)} className="p-1 hover:bg-stone-300 hover:text-stone-700" title="Editar">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => handleDelete(weapon.id)} className="p-1 hover:bg-red-200 hover:text-red-700" title="Eliminar">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mt-1">
                  <button onClick={() => rollAttack(weapon)}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-900 border border-red-200 rounded py-1 px-2 text-xs font-bold text-center transition-colors">
                    Atq: {atkString}
                  </button>
                  <button onClick={() => rollDamage(weapon)}
                    className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-800 border border-stone-300 rounded py-1 px-2 text-xs font-bold text-center transition-colors">
                    Daño: {dmgString} <span className="font-normal text-[0.65rem] truncate max-w-[60px] inline-block align-bottom">{weapon.damageType}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Formulario de añadir/editar */}
        {isAdding && (
          <div className="border border-red-300 bg-red-50/50 rounded p-2 space-y-2 text-xs text-stone-700 mt-2">
            <div className="font-bold text-red-800 mb-1">{editingId ? 'Editar Arma' : 'Nueva Arma'}</div>
            
            <input 
              type="text" 
              placeholder="Nombre del arma (ej. Espada Larga)" 
              className="text-input w-full p-1 border rounded"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              autoFocus
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[0.65rem] text-stone-500 font-bold uppercase mb-0.5">Característica</label>
                <select 
                  className="w-full p-1 border rounded bg-white text-xs"
                  value={formData.stat}
                  onChange={e => setFormData({...formData, stat: e.target.value})}
                >
                  {Object.entries(STAT_OPTIONS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[0.65rem] text-stone-500 font-bold uppercase mb-0.5">Daño</label>
                <input 
                  type="text" 
                  placeholder="1d8" 
                  className="text-input w-full p-1 border rounded"
                  value={formData.damageDice}
                  onChange={e => setFormData({...formData, damageDice: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-1 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={formData.isProficient}
                  onChange={e => setFormData({...formData, isProficient: e.target.checked})}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                Competente (+{pb})
              </label>

              <div className="flex items-center gap-1">
                <label className="block text-[0.65rem] text-stone-500 font-bold uppercase w-16">Tipo Daño</label>
                <input 
                  type="text" 
                  placeholder="Cortante" 
                  className="text-input flex-1 p-1 border rounded"
                  value={formData.damageType}
                  onChange={e => setFormData({...formData, damageType: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-1">
              <label className="block text-[0.65rem] text-stone-500 font-bold uppercase">Bono Mágico</label>
              <input 
                type="number" 
                className="text-input w-12 p-1 border rounded text-center"
                value={formData.magicBonus}
                onChange={e => setFormData({...formData, magicBonus: parseInt(e.target.value) || 0})}
              />
            </div>

            <div className="flex justify-end gap-1 mt-2 border-t border-red-200 pt-2">
              <button 
                onClick={resetForm}
                className="flex items-center gap-1 px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded transition-colors"
              >
                <X size={12} /> Cancelar
              </button>
              <button 
                onClick={handleSaveWeapon}
                disabled={!formData.name.trim()}
                className="flex items-center gap-1 px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded transition-colors disabled:opacity-50"
              >
                <Check size={12} /> Guardar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
