import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../../shared/utils/supabase'
import type { Workout } from '../../workouts/types'

export function DashboardPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null)
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [slug])

  async function loadDashboardData() {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Load today's workout
      const { data: todayData } = await supabase
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
        .eq('date', today)
        .single()

      if (todayData) setTodayWorkout(todayData)

      // Load upcoming workouts
      const { data: upcomingData } = await supabase
        .from('workouts')
        .select('*')
        .gt('date', today)
        .order('date', { ascending: true })
        .limit(5)

      if (upcomingData) setUpcomingWorkouts(upcomingData)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
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
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-1">{slug}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Workout */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-semibold mb-4">Treino de Hoje</h2>

              {todayWorkout ? (
                <div>
                  <h3 className="text-xl font-medium mb-4">{todayWorkout.name}</h3>

                  {todayWorkout.sections && todayWorkout.sections.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {todayWorkout.sections.map((section) => (
                        <div
                          key={section.id}
                          className="p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{section.name}</span>
                            {section.repeat_count > 1 && (
                              <span className="text-sm text-gray-400">
                                {section.repeat_count}x
                              </span>
                            )}
                          </div>
                          {section.exercises && section.exercises.length > 0 && (
                            <div className="text-sm text-gray-300 space-y-1">
                              {section.exercises.map(exercise => (
                                <div key={exercise.id}>• {exercise.name}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/${slug}/editor`)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                    >
                      Editar Treino
                    </button>
                    <button
                      onClick={() => navigate(`/${slug}/tv/${todayWorkout.id}`)}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                    >
                      🖥️ Executar na TV
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-400 mb-6">
                    Nenhum treino programado para hoje
                  </p>
                  <button
                    onClick={() => navigate(`/${slug}/editor`)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                  >
                    Criar Treino
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Upcoming */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
              <div className="space-y-2">
                <button
                  onClick={() => navigate(`/${slug}/editor`)}
                  className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
                >
                  ✏️ Editor de Treinos
                </button>
                <button
                  onClick={() => navigate(`/${slug}/library`)}
                  className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
                >
                  📚 Biblioteca
                </button>
                <button
                  onClick={() => navigate(`/${slug}/remote`)}
                  className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
                >
                  📱 Controle Remoto
                </button>
              </div>
            </div>

            {/* Upcoming Workouts */}
            {upcomingWorkouts.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Próximos Treinos</h2>
                <div className="space-y-2">
                  {upcomingWorkouts.map(workout => (
                    <div
                      key={workout.id}
                      className="p-3 bg-gray-700/50 rounded-lg"
                    >
                      <div className="font-medium">{workout.name}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {new Date(workout.date).toLocaleDateString('pt-BR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
