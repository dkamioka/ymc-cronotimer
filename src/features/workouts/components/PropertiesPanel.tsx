import { useState, useEffect } from 'react'
import { supabase } from '../../../shared/utils/supabase'
import type { Section, Exercise, Round } from '../types'

interface PropertiesPanelProps {
  section: Section | null
  onUpdateSection: (section: Section) => void
}

type SelectedItem =
  | { type: 'section'; item: Section }
  | { type: 'exercise'; item: Exercise; section: Section }
  | { type: 'round'; item: Round; exercise: Exercise; section: Section }
  | null

export function PropertiesPanel({ section, onUpdateSection }: PropertiesPanelProps) {
  const [selected, setSelected] = useState<SelectedItem>(null)

  useEffect(() => {
    if (section) {
      setSelected({ type: 'section', item: section })
    } else {
      setSelected(null)
    }
  }, [section])

  if (!selected) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-800 text-gray-400 p-8 text-center">
        Selecione uma seção, exercício ou round para editar
      </div>
    )
  }

  if (selected.type === 'section') {
    return <SectionProperties section={selected.item} onUpdate={onUpdateSection} />
  }

  if (selected.type === 'exercise') {
    return <ExerciseProperties exercise={selected.item} section={selected.section} />
  }

  if (selected.type === 'round') {
    return <RoundProperties round={selected.item} exercise={selected.exercise} />
  }

  return null
}

function SectionProperties({ section, onUpdate }: { section: Section; onUpdate: (s: Section) => void }) {
  const [name, setName] = useState(section.name)
  const [color, setColor] = useState(section.color || '#FF6B35')
  const [repeatCount, setRepeatCount] = useState(section.repeat_count)
  const [excludeFromTotal, setExcludeFromTotal] = useState(section.exclude_from_total)

  useEffect(() => {
    setName(section.name)
    setColor(section.color || '#FF6B35')
    setRepeatCount(section.repeat_count)
    setExcludeFromTotal(section.exclude_from_total)
  }, [section])

  async function updateSection(updates: Partial<Section>) {
    try {
      const { data, error } = await supabase
        .from('sections')
        .update(updates)
        .eq('id', section.id)
        .select()
        .single()

      if (error) throw error
      if (data) onUpdate(data as any)
    } catch (error) {
      console.error('Error updating section:', error)
    }
  }

  async function deleteSection() {
    if (!confirm('Tem certeza que deseja excluir esta seção?')) return

    try {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', section.id)

      if (error) throw error
      // Parent will handle UI update
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
        <h2 className="text-xl font-semibold">Seção</h2>
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

function ExerciseProperties({ exercise, section }: { exercise: Exercise; section: Section }) {
  const [name, setName] = useState(exercise.name)
  const [notes, setNotes] = useState(exercise.notes || '')

  async function updateExercise(updates: Partial<Exercise>) {
    try {
      const { error } = await supabase
        .from('exercises')
        .update(updates)
        .eq('id', exercise.id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating exercise:', error)
    }
  }

  async function deleteExercise() {
    if (!confirm('Excluir este exercício?')) return

    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exercise.id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting exercise:', error)
    }
  }

  return (
    <div className="h-full bg-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold">Exercício</h2>
        <p className="text-sm text-gray-400 mt-1">Seção: {section.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => updateExercise({ name })}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Notas
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => updateExercise({ notes })}
            rows={4}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
            placeholder="Ex: 5x5 @ 80% 1RM"
          />
        </div>
      </div>

      <div className="p-6 border-t border-gray-700">
        <button
          onClick={deleteExercise}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium transition-colors"
        >
          Excluir Exercício
        </button>
      </div>
    </div>
  )
}

function RoundProperties({ round, exercise }: { round: Round; exercise: Exercise }) {
  const [duration, setDuration] = useState(round.duration)
  const [mode, setMode] = useState(round.mode)
  const [excludeFromTotal, setExcludeFromTotal] = useState(round.exclude_from_total)

  // Parse duration for easy editing
  const [minutes, setMinutes] = useState('0')
  const [seconds, setSeconds] = useState('0')

  useEffect(() => {
    const parts = round.duration.split(':')
    if (parts.length === 3) {
      const totalSeconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
      setMinutes(Math.floor(totalSeconds / 60).toString())
      setSeconds((totalSeconds % 60).toString())
    }
  }, [round.duration])

  async function updateRound(updates: Partial<Round>) {
    try {
      const { error } = await supabase
        .from('rounds')
        .update(updates)
        .eq('id', round.id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating round:', error)
    }
  }

  function updateDuration(mins: string, secs: string) {
    const m = parseInt(mins) || 0
    const s = parseInt(secs) || 0
    const formatted = `00:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    setDuration(formatted)
    updateRound({ duration: formatted })
  }

  async function deleteRound() {
    if (!confirm('Excluir este round?')) return

    try {
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', round.id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting round:', error)
    }
  }

  return (
    <div className="h-full bg-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold">Round</h2>
        <p className="text-sm text-gray-400 mt-1">Exercício: {exercise.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Duração
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={minutes}
              onChange={(e) => {
                setMinutes(e.target.value)
                updateDuration(e.target.value, seconds)
              }}
              className="w-20 px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
            />
            <span>min</span>
            <input
              type="number"
              min="0"
              max="59"
              value={seconds}
              onChange={(e) => {
                setSeconds(e.target.value)
                updateDuration(minutes, e.target.value)
              }}
              className="w-20 px-3 py-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
            />
            <span>seg</span>
          </div>
        </div>

        {/* Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Modo
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-900 rounded border border-gray-700 hover:border-blue-500 transition-colors">
              <input
                type="radio"
                name="mode"
                checked={mode === 'countdown'}
                onChange={() => {
                  setMode('countdown')
                  updateRound({ mode: 'countdown' })
                }}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium">↓ Countdown</div>
                <div className="text-xs text-gray-400">Conta regressiva (AMRAP, EMOM, Rest)</div>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-900 rounded border border-gray-700 hover:border-blue-500 transition-colors">
              <input
                type="radio"
                name="mode"
                checked={mode === 'countup'}
                onChange={() => {
                  setMode('countup')
                  updateRound({ mode: 'countup' })
                }}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium">↑ Count-up</div>
                <div className="text-xs text-gray-400">Tempo aberto (For Time, Mobilidade)</div>
              </div>
            </label>
          </div>
        </div>

        {/* Exclude from total */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={excludeFromTotal}
              onChange={(e) => {
                setExcludeFromTotal(e.target.checked)
                updateRound({ exclude_from_total: e.target.checked })
              }}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-300">
              Excluir do tempo total
            </span>
          </label>
        </div>
      </div>

      <div className="p-6 border-t border-gray-700">
        <button
          onClick={deleteRound}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium transition-colors"
        >
          Excluir Round
        </button>
      </div>
    </div>
  )
}
