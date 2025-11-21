import { useState, useEffect } from 'react'
import { supabase } from '../../../shared/utils/supabase'
import type { Section } from '../types'

interface PropertiesPanelProps {
  section: Section | null
  onUpdateSection: (section: Section) => void
}

export function PropertiesPanel({ section, onUpdateSection }: PropertiesPanelProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#FF6B35')
  const [repeatCount, setRepeatCount] = useState(1)
  const [excludeFromTotal, setExcludeFromTotal] = useState(false)

  useEffect(() => {
    if (section) {
      setName(section.name)
      setColor(section.color || '#FF6B35')
      setRepeatCount(section.repeat_count)
      setExcludeFromTotal(section.exclude_from_total)
    }
  }, [section])

  if (!section) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-800 text-gray-400 p-8 text-center">
        Selecione uma seção para editar suas propriedades
      </div>
    )
  }

  async function updateSection(updates: Partial<Section>) {
    try {
      const { data, error } = await supabase
        .from('sections')
        .update(updates)
        .eq('id', section.id)
        .select()
        .single()

      if (error) throw error
      if (data) onUpdateSection(data)
    } catch (error) {
      console.error('Error updating section:', error)
    }
  }

  async function deleteSection() {
    if (!section) return
    if (!confirm('Tem certeza que deseja excluir esta seção?')) return

    try {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', section.id)

      if (error) throw error
      // Parent component will handle removing from list
    } catch (error) {
      console.error('Error deleting section:', error)
    }
  }

  const colorPresets = [
    { name: 'Aquecimento', color: '#FF6B35' },
    { name: 'Técnica', color: '#004E89' },
    { name: 'WOD', color: '#C1121F' },
    { name: 'Cooldown', color: '#2A9D8F' },
    { name: 'Rest', color: '#212529' }
  ]

  return (
    <div className="h-full bg-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold">Propriedades</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => updateSection({ name })}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Repeat Count */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Repetir
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={repeatCount}
            onChange={(e) => {
              const value = parseInt(e.target.value)
              setRepeatCount(value)
              updateSection({ repeat_count: value })
            }}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Número de vezes que a seção será executada
          </p>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cor
          </label>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {colorPresets.map((preset) => (
              <button
                key={preset.color}
                onClick={() => {
                  setColor(preset.color)
                  updateSection({ color: preset.color })
                }}
                className={`w-full aspect-square rounded border-2 transition-all ${
                  color === preset.color
                    ? 'border-white scale-110'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: preset.color }}
                title={preset.name}
              />
            ))}
          </div>
          <input
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value)
              updateSection({ color: e.target.value })
            }}
            className="w-full h-10 rounded border border-gray-700 cursor-pointer"
          />
        </div>

        {/* Exclude from total */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={excludeFromTotal}
              onChange={(e) => {
                setExcludeFromTotal(e.target.checked)
                updateSection({ exclude_from_total: e.target.checked })
              }}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-300">
              Excluir do tempo total
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Esta seção não será contabilizada no tempo total do treino
          </p>
        </div>
      </div>

      {/* Delete button */}
      <div className="p-6 border-t border-gray-700">
        <button
          onClick={deleteSection}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium transition-colors"
        >
          Excluir Seção
        </button>
      </div>
    </div>
  )
}
