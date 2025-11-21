import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../../shared/utils/supabase'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="h-screen flex">
        {/* Left Sidebar - Library */}
        <div className="w-64 border-r border-gray-800 flex flex-col">
          <WorkoutLibrary
            workouts={workouts}
            selectedWorkout={selectedWorkout}
            onSelectWorkout={setSelectedWorkout}
            onCreateWorkout={createNewWorkout}
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
          />
        </div>
      </div>
    </div>
  )
}
