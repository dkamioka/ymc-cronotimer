import { useState } from 'react'
import { supabase } from '../../../shared/utils/supabase'
import type { Workout, Section } from '../types'

interface WorkoutCanvasProps {
  workout: Workout | null
  selectedSection: Section | null
  onSelectSection: (section: Section | null) => void
  onUpdateWorkout: (workout: Workout) => void
}

export function WorkoutCanvas({
  workout,
  selectedSection,
  onSelectSection,
  onUpdateWorkout
}: WorkoutCanvasProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [workoutName, setWorkoutName] = useState(workout?.name || '')
  const [isEditingDate, setIsEditingDate] = useState(false)
  const [workoutDate, setWorkoutDate] = useState(workout?.date || '')

  if (!workout) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <div className="text-xl text-gray-400">
            Selecione um treino ou crie um novo
          </div>
        </div>
      </div>
    )
  }

  async function updateWorkoutName() {
    if (!workout || workoutName === workout.name) {
      setIsEditingName(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('workouts')
        .update({ name: workoutName })
        .eq('id', workout.id)
        .select()
        .single()

      if (error) throw error
      if (data) onUpdateWorkout(data as any)
      setIsEditingName(false)
    } catch (error) {
      console.error('Error updating workout name:', error)
    }
  }

  async function updateWorkoutDate() {
    if (!workout || workoutDate === workout.date) {
      setIsEditingDate(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('workouts')
        .update({ date: workoutDate })
        .eq('id', workout.id)
        .select()
        .single()

      if (error) throw error
      if (data) onUpdateWorkout(data as any)
      setIsEditingDate(false)
    } catch (error) {
      console.error('Error updating workout date:', error)
    }
  }

  async function addSection(preset?: string) {
    if (!workout) return

    const presets: Record<string, { name: string; color: string }> = {
      warmup: { name: 'Aquecimento', color: '#FF6B35' },
      technique: { name: 'Técnica', color: '#004E89' },
      wod: { name: 'WOD', color: '#C1121F' },
      amrap: { name: 'AMRAP', color: '#C1121F' },
      emom: { name: 'EMOM', color: '#9D4EDD' },
      tabata: { name: 'TABATA', color: '#06FFA5' },
      rest: { name: 'Descanso', color: '#212529' },
      custom: { name: 'Nova Seção', color: '#6C757D' }
    }

    const config = presets[preset || 'custom']

    try {
      const { data, error } = await supabase
        .from('sections')
        .insert({
          workout_id: workout.id,
          name: config.name,
          order: workout.sections?.length || 0,
          color: config.color,
          repeat_count: 1,
          exclude_from_total: false
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        const updated = {
          ...workout,
          sections: [...(workout.sections || []), data as any]
        }
        onUpdateWorkout(updated as any)
        onSelectSection(data as any)
      }
    } catch (error) {
      console.error('Error adding section:', error)
    }
  }

  async function addExercise(sectionId: string) {
    if (!workout) return

    try {
      const section = workout.sections?.find(s => s.id === sectionId)
      if (!section) return

      const { data, error } = await supabase
        .from('exercises')
        .insert({
          section_id: sectionId,
          name: 'Novo Exercício',
          order: section.exercises?.length || 0,
          notes: null
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        // Refresh workout
        const { data: refreshed } = await supabase
          .from('workouts')
          .select(`
            *,
            sections (
              *,
              exercises (
                *,
                rounds (*)
              )
            )
          `)
          .eq('id', workout.id)
          .single()

        if (refreshed) onUpdateWorkout(refreshed as any)
      }
    } catch (error) {
      console.error('Error adding exercise:', error)
    }
  }

  async function addRound(exerciseId: string) {
    if (!workout) return

    try {
      const exercise = workout.sections
        ?.flatMap(s => s.exercises || [])
        .find(e => e.id === exerciseId)

      if (!exercise) return

      const { data, error } = await supabase
        .from('rounds')
        .insert({
          exercise_id: exerciseId,
          duration: '00:01:00', // 1 minute default
          mode: 'countdown',
          order: exercise.rounds?.length || 0,
          exclude_from_total: false,
          color: null
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        // Refresh workout
        const { data: refreshed } = await supabase
          .from('workouts')
          .select(`
            *,
            sections (
              *,
              exercises (
                *,
                rounds (*)
              )
            )
          `)
          .eq('id', workout.id)
          .single()

        if (refreshed) onUpdateWorkout(refreshed as any)
      }
    } catch (error) {
      console.error('Error adding round:', error)
    }
  }

  const totalDuration = calculateTotalDuration(workout)

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        {isEditingName ? (
          <input
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            onBlur={updateWorkoutName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateWorkoutName()
              if (e.key === 'Escape') {
                setWorkoutName(workout.name)
                setIsEditingName(false)
              }
            }}
            className="text-3xl font-bold bg-gray-800 border border-gray-700 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500"
            autoFocus
          />
        ) : (
          <h1
            className="text-3xl font-bold cursor-pointer hover:text-blue-400 transition-colors"
            onClick={() => setIsEditingName(true)}
          >
            {workout.name}
          </h1>
        )}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-4">
            {/* Date Selector */}
            {isEditingDate ? (
              <input
                type="date"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
                onBlur={updateWorkoutDate}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateWorkoutDate()
                  if (e.key === 'Escape') {
                    setWorkoutDate(workout.date)
                    setIsEditingDate(false)
                  }
                }}
                className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:border-blue-500"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingDate(true)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors flex items-center gap-2"
              >
                <span>📅</span>
                <span>{new Date(workout.date).toLocaleDateString('pt-BR')}</span>
              </button>
            )}

            {/* Today indicator */}
            {workout.date === new Date().toISOString().split('T')[0] && (
              <span className="px-2 py-1 bg-green-600 text-white text-xs rounded font-medium">
                HOJE
              </span>
            )}

            {workout.is_template && (
              <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">
                TEMPLATE
              </span>
            )}
          </div>

          {/* Save and Publish Button */}
          <button
            onClick={() => {
              // Workout is already auto-saved, this is just for user feedback
              alert('Treino salvo! Todas as alterações são salvas automaticamente.')
            }}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>✓</span>
            <span>Salvo</span>
          </button>
        </div>
      </div>

      {/* Timeline/Canvas */}
      <div className="flex-1 overflow-y-auto p-6">
        {(!workout.sections || workout.sections.length === 0) ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-6">Nenhuma seção ainda</div>
            <SectionPresetButtons onSelect={addSection} />
          </div>
        ) : (
          <div className="space-y-4">
            {workout.sections.map((section) => (
              <div key={section.id} className="space-y-2">
                <div
                  onClick={() => onSelectSection(section)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSection?.id === section.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  style={{
                    backgroundColor: selectedSection?.id === section.id
                      ? undefined
                      : `${section.color}15`
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: section.color || '#6C757D' }}
                      />
                      <h3 className="text-xl font-semibold">{section.name}</h3>
                      {section.repeat_count > 1 && (
                        <span className="text-sm px-2 py-1 bg-gray-700 rounded">
                          {section.repeat_count}x
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        addExercise(section.id)
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                    >
                      + Exercício
                    </button>
                  </div>

                  {section.exercises && section.exercises.length > 0 && (
                    <div className="space-y-2 pl-6">
                      {section.exercises.map((exercise) => (
                        <div key={exercise.id} className="bg-gray-800/50 rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{exercise.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                addRound(exercise.id)
                              }}
                              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                            >
                              + Round
                            </button>
                          </div>
                          {exercise.rounds && exercise.rounds.length > 0 && (
                            <div className="space-y-1 pl-4 text-sm text-gray-400">
                              {exercise.rounds.map((round) => (
                                <div key={round.id} className="flex items-center gap-2">
                                  <span>{round.mode === 'countdown' ? '↓' : '↑'}</span>
                                  <span>{formatDuration(round.duration)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-4">
              <SectionPresetButtons onSelect={addSection} />
            </div>
          </div>
        )}
      </div>

      {/* Footer with total */}
      <div className="p-4 border-t border-gray-800 bg-gray-800/50">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Duração Total</span>
          <span className="text-xl font-bold">{totalDuration}</span>
        </div>
      </div>
    </div>
  )
}

function SectionPresetButtons({ onSelect }: { onSelect: (preset: string) => void }) {
  const presets = [
    { id: 'warmup', label: 'Aquecimento', icon: '🔥' },
    { id: 'technique', label: 'Técnica', icon: '💪' },
    { id: 'wod', label: 'WOD', icon: '⚡' },
    { id: 'amrap', label: 'AMRAP', icon: '🔄' },
    { id: 'emom', label: 'EMOM', icon: '⏱️' },
    { id: 'tabata', label: 'TABATA', icon: '⚡' },
    { id: 'rest', label: 'Descanso', icon: '😴' },
    { id: 'custom', label: 'Personalizado', icon: '➕' }
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {presets.map(preset => (
        <button
          key={preset.id}
          onClick={() => onSelect(preset.id)}
          className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 rounded-lg transition-colors text-center"
        >
          <div className="text-2xl mb-1">{preset.icon}</div>
          <div className="text-sm">{preset.label}</div>
        </button>
      ))}
    </div>
  )
}

function calculateTotalDuration(workout: Workout): string {
  if (!workout.sections || workout.sections.length === 0) {
    return '00:00'
  }

  let totalSeconds = 0
  workout.sections.forEach(section => {
    if (section.exclude_from_total) return

    const sectionSeconds = section.exercises?.reduce((sum, exercise) => {
      const exerciseSeconds = exercise.rounds?.reduce((roundSum, round) => {
        if (round.exclude_from_total) return roundSum
        const parts = round.duration.split(':')
        if (parts.length === 3) {
          return roundSum + (parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]))
        }
        return roundSum
      }, 0) || 0
      return sum + exerciseSeconds
    }, 0) || 0

    totalSeconds += sectionSeconds * (section.repeat_count || 1)
  })

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function formatDuration(duration: string): string {
  const parts = duration.split(':')
  if (parts.length === 3) {
    const hours = parseInt(parts[0])
    const minutes = parseInt(parts[1])
    const seconds = parseInt(parts[2])
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  return duration
}
