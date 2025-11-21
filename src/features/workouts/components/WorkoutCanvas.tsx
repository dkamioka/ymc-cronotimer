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
  const [isEditing, setIsEditing] = useState(false)
  const [workoutName, setWorkoutName] = useState(workout?.name || '')

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
      setIsEditing(false)
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
      if (data) onUpdateWorkout(data)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating workout name:', error)
    }
  }

  async function addSection() {
    try {
      const { data, error } = await supabase
        .from('sections')
        .insert({
          workout_id: workout.id,
          name: 'Nova Seção',
          order: workout.sections?.length || 0,
          repeat_count: 1,
          exclude_from_total: false
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        const updated = {
          ...workout,
          sections: [...(workout.sections || []), data]
        }
        onUpdateWorkout(updated)
        onSelectSection(data)
      }
    } catch (error) {
      console.error('Error adding section:', error)
    }
  }

  const totalDuration = calculateTotalDuration(workout)

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        {isEditing ? (
          <input
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            onBlur={updateWorkoutName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateWorkoutName()
              if (e.key === 'Escape') {
                setWorkoutName(workout.name)
                setIsEditing(false)
              }
            }}
            className="text-3xl font-bold bg-gray-800 border border-gray-700 rounded px-3 py-2 w-full focus:outline-none focus:border-blue-500"
            autoFocus
          />
        ) : (
          <h1
            className="text-3xl font-bold cursor-pointer hover:text-blue-400 transition-colors"
            onClick={() => setIsEditing(true)}
          >
            {workout.name}
          </h1>
        )}
        <div className="flex items-center gap-4 mt-2 text-gray-400">
          <span>{new Date(workout.date).toLocaleDateString('pt-BR')}</span>
          {workout.is_template && (
            <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">
              TEMPLATE
            </span>
          )}
        </div>
      </div>

      {/* Timeline/Canvas */}
      <div className="flex-1 overflow-y-auto p-6">
        {(!workout.sections || workout.sections.length === 0) ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Nenhuma seção ainda</div>
            <button
              onClick={addSection}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              + Adicionar Seção
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {workout.sections.map((section) => (
              <div
                key={section.id}
                onClick={() => onSelectSection(section)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedSection?.id === section.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{section.name}</h3>
                  {section.repeat_count > 1 && (
                    <span className="text-sm text-gray-400">
                      {section.repeat_count}x
                    </span>
                  )}
                </div>
                {section.exercises && section.exercises.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {section.exercises.map((exercise) => (
                      <div key={exercise.id} className="text-gray-300 pl-4">
                        ├─ {exercise.name}
                        {exercise.rounds && exercise.rounds.length > 0 && (
                          <span className="text-gray-500 ml-2">
                            ({exercise.rounds.length} rounds)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={addSection}
              className="w-full px-6 py-3 border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-lg font-medium transition-colors text-gray-400 hover:text-blue-400"
            >
              + Adicionar Seção
            </button>
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

function calculateTotalDuration(workout: Workout): string {
  if (!workout.sections || workout.sections.length === 0) {
    return '00:00'
  }

  let totalSeconds = 0
  workout.sections.forEach(section => {
    if (section.exclude_from_total) return

    section.exercises?.forEach(exercise => {
      exercise.rounds?.forEach(round => {
        if (round.exclude_from_total) return
        // Parse PostgreSQL interval (simplified)
        const duration = round.duration || '00:00:00'
        const parts = duration.split(':')
        if (parts.length === 3) {
          totalSeconds += parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
        }
      })
    })
  })

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
