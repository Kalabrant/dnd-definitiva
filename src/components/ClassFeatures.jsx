import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Loader2, Globe } from 'lucide-react'
import { loadClass } from '../utils/dataLoader'
import { EntryBlock } from './RuleText'
import { translateFeatureName } from '../utils/featureTranslations'
import { CLASS_ES } from '../utils/spellLists'

function FeatureCard({ feature, onDiceRoll, onSpellClick }) {
  const [open, setOpen] = useState(false)
  const nameES = translateFeatureName(feature.name)
  const isTranslated = nameES !== feature.name

  return (
    <div className="border border-stone-200 rounded overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-3 py-2 bg-white/50 hover:bg-stone-100 transition-colors text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {open
            ? <ChevronDown size={12} className="text-stone-500 flex-shrink-0" />
            : <ChevronRight size={12} className="text-stone-500 flex-shrink-0" />}
          <div className="min-w-0">
            <span className="text-sm font-semibold text-stone-800">{nameES}</span>
            {isTranslated && (
              <span className="ml-1.5 text-xs text-stone-400 italic hidden sm:inline">
                ({feature.name})
              </span>
            )}
          </div>
          <span className="text-xs text-stone-400 flex-shrink-0 ml-1">Nv.{feature.level}</span>
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 bg-amber-50/60 border-t border-stone-200">
          {/* Aviso de idioma */}
          <div className="flex items-center gap-1 mt-2 mb-1 text-xs text-stone-400 italic" lang="es">
            <Globe size={10} />
            Texto oficial en inglés · clic derecho → "Traducir al español"
          </div>
          {(feature.entries ?? []).map((entry, i) => (
            <EntryBlock key={i} entry={entry} onDiceRoll={onDiceRoll} onSpellClick={onSpellClick} />
          ))}
        </div>
      )}
    </div>
  )
}

export function ClassFeatures({ character, onDiceRoll, onSpellClick }) {
  const [classData, setClassData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!character.class) return
    setLoading(true)
    setError(null)
    loadClass(character.class)
      .then(setClassData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [character.class])

  const classInfo = classData
    ? (character.edition === '2024' ? classData.class2024 : classData.class2014) ?? classData.class2024
    : null

  const availableFeatures = (classData?.features ?? []).filter(f => {
    const matchClass = f.className?.toLowerCase() === character.class.toLowerCase()
    const matchSource = character.edition === '2024' ? f.classSource === 'XPHB' : f.classSource === 'PHB'
    return matchClass && matchSource && f.level <= character.level
  })

  const classNameES = CLASS_ES[character.class] ?? character.class

  return (
    <div className="panel">
      <div className="panel-header flex items-center justify-between">
        <span className="flex items-center gap-2">
          Rasgos de {classNameES}
          {classInfo && (
            <span className="text-red-300 font-normal normal-case text-xs">
              · d{classInfo.hd?.faces} · {character.edition === '2024' ? '2024' : 'Legado'}
            </span>
          )}
        </span>
        {availableFeatures.length > 0 && (
          <span className="text-red-300 font-normal text-xs normal-case">
            {availableFeatures.length} rasgos
          </span>
        )}
      </div>

      <div className="panel-body space-y-1.5">
        {loading && (
          <div className="flex items-center gap-2 text-xs text-stone-400 py-2">
            <Loader2 size={14} className="animate-spin" />
            Cargando {classNameES}...
          </div>
        )}
        {error && (
          <p className="text-xs text-red-600 py-2">Error: {error}</p>
        )}
        {!loading && !error && availableFeatures.length === 0 && !classData && (
          <p className="text-xs text-stone-400 py-2 text-center">
            Selecciona una clase y nivel.
          </p>
        )}
        {!loading && !error && classData && availableFeatures.length === 0 && (
          <p className="text-xs text-stone-400 py-2 text-center">
            Sin rasgos para nivel {character.level} ({character.edition}).
          </p>
        )}

        {availableFeatures.map((feature, i) => (
          <FeatureCard
            key={`${feature.name}-${feature.level}-${i}`}
            feature={feature}
            onDiceRoll={onDiceRoll}
            onSpellClick={onSpellClick}
          />
        ))}

        {/* Competencias iniciales */}
        {classInfo?.startingProficiencies && (
          <div className="mt-3 pt-3 border-t border-stone-200">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Competencias Iniciales
            </p>
            <div className="text-xs text-stone-600 space-y-1">
              {classInfo.startingProficiencies.armor && (
                <p lang="en">
                  <span className="font-semibold" lang="es">Armadura: </span>
                  {classInfo.startingProficiencies.armor
                    .map(a => typeof a === 'string' ? a : a.full ?? JSON.stringify(a))
                    .join(', ')}
                </p>
              )}
              {classInfo.startingProficiencies.weapons && (
                <p lang="en">
                  <span className="font-semibold" lang="es">Armas: </span>
                  {classInfo.startingProficiencies.weapons
                    .map(w => typeof w === 'string' ? w : w.full ?? JSON.stringify(w))
                    .join(', ')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Nota global de idioma */}
        <div className="pt-2 border-t border-stone-200 flex items-center gap-1 text-xs text-stone-400" lang="es">
          <Globe size={10} />
          Descripciones en inglés oficial · usa la traducción del navegador
        </div>
      </div>
    </div>
  )
}
