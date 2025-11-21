import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../../shared/utils/supabase'
import { PageHeader } from '../../../shared/components/PageHeader'
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner'
import { WorkoutLibrary } from './WorkoutLibrary'
import { WorkoutCanvas } from './WorkoutCanvas'
import { PropertiesPanel } from './PropertiesPanel'
import type { Workout, Section } from '../types'

export function WorkoutEditorPage() {
  const { slug } = useParams<{ slug: string }>()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkouts()
  }, [slug])

  async function loadWorkouts() {
    try {
      // First get user's box_id
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('box_id')
        .eq('id', user.id)
        .single()

      if (!userData) return

      const { data, error } = await supabase
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
        .eq('box_id', userData.box_id)
        .order('date', { ascending: false })

      if (error) throw error
      setWorkouts((data as any) || [])
    } catch (error) {
      console.error('Error loading workouts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createNewWorkout() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('box_id')
        .eq('id', user.id)
        .single()

      if (!userData) return

      const today = new Date().toISOString().split('T')[0]
      const { data: workout, error } = await supabase
        .from('workouts')
        .insert({
          box_id: userData.box_id,
          name: 'Novo Treino',
          slug: `workout-${Date.now()}`,
          date: today,
          owner_id: user.id,
          is_template: false
        })
        .select()
        .single()

      if (error) throw error
      if (workout) {
        setWorkouts([workout as any, ...workouts])
        setSelectedWorkout(workout as any)
      }
    } catch (error) {
      console.error('Error creating workout:', error)
    }
  }

  async function duplicateWorkout(workout: Workout) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('box_id')
        .eq('id', user.id)
        .single()

      if (!userData) return

      // Create new workout with same structure
      const today = new Date().toISOString().split('T')[0]
      const { data: newWorkout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          box_id: userData.box_id,
          name: `${workout.name} (Cópia)`,
          slug: `workout-${Date.now()}`,
          date: today,
          owner_id: user.id,
          is_template: false
        })
        .select()
        .single()

      if (workoutError) throw workoutError
      if (!newWorkout) return

      // Duplicate all sections, exercises, and rounds
      if (workout.sections && workout.sections.length > 0) {
        for (const section of workout.sections) {
          const { data: newSection } = await supabase
            .from('sections')
            .insert({
              workout_id: newWorkout.id,
              name: section.name,
              order: section.order,
              color: section.color,
              repeat_count: section.repeat_count,
              exclude_from_total: section.exclude_from_total
            })
            .select()
            .single()

          if (newSection && section.exercises) {
            for (const exercise of section.exercises) {
              const { data: newExercise } = await supabase
                .from('exercises')
                .insert({
                  section_id: newSection.id,
                  name: exercise.name,
                  order: exercise.order,
                  notes: exercise.notes
                })
                .select()
                .single()

              if (newExercise && exercise.rounds) {
                for (const round of exercise.rounds) {
                  await supabase
                    .from('rounds')
                    .insert({
                      exercise_id: newExercise.id,
                      duration: round.duration,
                      mode: round.mode,
                      order: round.order,
                      exclude_from_total: round.exclude_from_total,
                      color: round.color
                    })
                }
              }
            }
          }
        }
      }

      // Reload workouts
      await loadWorkouts()
    } catch (error) {
      console.error('Error duplicating workout:', error)
    }
  }

  async function saveAsTemplate(workout: Workout) {
    try {
      const { error } = await supabase
        .from('workouts')
        .update({ is_template: true })
        .eq('id', workout.id)

      if (error) throw error

      // Reload workouts to reflect template status
      await loadWorkouts()
    } catch (error) {
      console.error('Error saving as template:', error)
    }
  }

  async function refreshCurrentWorkout() {
    if (!selectedWorkout) return

    try {
      const { data, error } = await supabase
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
        .eq('id', selectedWorkout.id)
        .single()

      if (error) throw error
      if (data) {
        const refreshed = data as any
        setSelectedWorkout(refreshed)
        setWorkouts(workouts.map(w => w.id === refreshed.id ? refreshed : w))
      }
    } catch (error) {
      console.error('Error refreshing workout:', error)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen size="xl" message="Carregando treinos..." />
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <PageHeader title="Editor de Treinos" />

      <div className="flex-1 flex">
        {/* Left Sidebar - Library */}
        <div className="w-64 border-r border-gray-800 flex flex-col">
          <WorkoutLibrary
            workouts={workouts}
            selectedWorkout={selectedWorkout}
            onSelectWorkout={setSelectedWorkout}
            onCreateWorkout={createNewWorkout}
            onDuplicateWorkout={duplicateWorkout}
            onSaveAsTemplate={saveAsTemplate}
          />
        </div>

        {/* Center - Canvas/Timeline */}
        <div className="flex-1 flex flex-col">
          <WorkoutCanvas
            workout={selectedWorkout}
            selectedSection={selectedSection}
            onSelectSection={setSelectedSection}
            onUpdateWorkout={(updated) => {
              setWorkouts(workouts.map(w => w.id === updated.id ? updated : w))
              setSelectedWorkout(updated)
            }}
          />
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l border-gray-800">
          <PropertiesPanel
            section={selectedSection}
            onUpdateSection={(updated) => {
              if (!selectedWorkout) return
              const updatedWorkout = {
                ...selectedWorkout,
                sections: selectedWorkout.sections?.map(s =>
                  s.id === updated.id ? updated : s
                )
              }
              setSelectedWorkout(updatedWorkout)
            }}
            onDeleteSection={async () => {
              // Clear selection and refresh workout
              setSelectedSection(null)
              await refreshCurrentWorkout()
            }}
            onRefreshWorkout={async () => {
              // Refresh current workout after exercise/round deletion
              await refreshCurrentWorkout()
            }}
          />
        </div>
      </div>
    </div>
  )
}
