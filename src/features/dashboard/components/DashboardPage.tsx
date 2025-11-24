import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../../shared/utils/supabase'
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner'
import type { Workout } from '../../workouts/types'

export function DashboardPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [todayWorkouts, setTodayWorkouts] = useState<Workout[]>([])
  const [favoriteWorkouts, setFavoriteWorkouts] = useState<Workout[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [slug])

  async function loadDashboardData() {
    try {
      const today = new Date().toISOString().split('T')[0]

      // Get box_id first
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('box_id')
        .eq('id', user.id)
        .single<{ box_id: string }>()

      if (!userData) return

      // Load today's workouts
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
        .eq('box_id', userData.box_id)
        .eq('date', today)
        .order('created_at', { ascending: false })

      if (todayData) setTodayWorkouts(todayData)

      // Load favorite workouts
      const { data: favData } = await supabase
        .from('workouts')
        .select('*')
        .eq('box_id', userData.box_id)
        .eq('is_favorite', true)
        .order('updated_at', { ascending: false })
        .limit(6)

      if (favData) setFavoriteWorkouts(favData)

      // Load recent workouts (executed or created in last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: recentData } = await supabase
        .from('workouts')
        .select('*')
        .eq('box_id', userData.box_id)
        .or(`last_executed_at.gte.${sevenDaysAgo.toISOString()},created_at.gte.${sevenDaysAgo.toISOString()}`)
        .order('last_executed_at', { ascending: false, nullsFirst: false })
        .limit(6)

      if (recentData) setRecentWorkouts(recentData)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  async function openOnTV(workout: Workout) {
    // Update last_executed_at
    await supabase
      .from('workouts')
      .update({ last_executed_at: new Date().toISOString() })
      .eq('id', workout.id)

    // Open in new tab/window for TV display
    window.open(`/${slug}/tv/${workout.id}`, '_blank')
  }

  async function toggleFavorite(workoutId: string, currentValue: boolean) {
    await supabase
      .from('workouts')
      .update({ is_favorite: !currentValue })
      .eq('id', workoutId)

    // Refresh data
    loadDashboardData()
  }

  if (loading) {
    return <LoadingSpinner fullScreen size="xl" message="Carregando dashboard..." />
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-400 mt-1">{slug}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/${slug}/editor`)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                ✏️ Novo Treino
              </button>
              <button
                onClick={() => navigate(`/${slug}/library`)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                📚 Biblioteca
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* TODAY'S WORKOUTS - Main Focus */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>📅</span>
            <span>Treinos de Hoje</span>
          </h2>

          {todayWorkouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayWorkouts.map(workout => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onOpenTV={() => openOnTV(workout)}
                  onToggleFavorite={() => toggleFavorite(workout.id, workout.is_favorite || false)}
                  onEdit={() => navigate(`/${slug}/editor?date=${workout.date}&id=${workout.id}`)}
                  showDate={false}
                  primaryAction="tv"
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-400 mb-6 text-lg">
                Nenhum treino programado para hoje
              </p>
              <button
                onClick={() => navigate(`/${slug}/editor`)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                Criar Treino de Hoje
              </button>
            </div>
          )}
        </section>

        {/* FAVORITES */}
        {favoriteWorkouts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>⭐</span>
              <span>Favoritos</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteWorkouts.map(workout => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onOpenTV={() => openOnTV(workout)}
                  onToggleFavorite={() => toggleFavorite(workout.id, workout.is_favorite || false)}
                  onEdit={() => navigate(`/${slug}/editor?date=${workout.date}&id=${workout.id}`)}
                  showDate={true}
                  primaryAction="tv"
                />
              ))}
            </div>
          </section>
        )}

        {/* RECENT WORKOUTS */}
        {recentWorkouts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>🕐</span>
              <span>Recentes</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentWorkouts.map(workout => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onOpenTV={() => openOnTV(workout)}
                  onToggleFavorite={() => toggleFavorite(workout.id, workout.is_favorite || false)}
                  onEdit={() => navigate(`/${slug}/editor?date=${workout.date}&id=${workout.id}`)}
                  showDate={true}
                  primaryAction="tv"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

interface WorkoutCardProps {
  workout: Workout
  onOpenTV: () => void
  onToggleFavorite: () => void
  onEdit: () => void
  showDate: boolean
  primaryAction: 'tv' | 'edit'
}

function WorkoutCard({ workout, onOpenTV, onToggleFavorite, onEdit, showDate, primaryAction }: WorkoutCardProps) {
  const sectionCount = workout.sections?.length || 0
  const totalExercises = workout.sections?.reduce((sum, s) => sum + (s.exercises?.length || 0), 0) || 0

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg flex-1 line-clamp-2">{workout.name}</h3>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            className="text-2xl hover:scale-110 transition-transform"
          >
            {workout.is_favorite ? '⭐' : '☆'}
          </button>
        </div>
        {showDate && (
          <p className="text-sm text-gray-400 mt-1">
            {new Date(workout.date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Stats */}
        <div className="flex gap-4 text-sm text-gray-400">
          <span>{sectionCount} seção{sectionCount !== 1 ? 'ões' : ''}</span>
          <span>•</span>
          <span>{totalExercises} exercício{totalExercises !== 1 ? 's' : ''}</span>
        </div>

        {/* Last executed */}
        {workout.last_executed_at && (
          <p className="text-xs text-gray-500">
            Último uso: {new Date(workout.last_executed_at).toLocaleDateString('pt-BR')}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {primaryAction === 'tv' ? (
            <>
              <button
                onClick={onOpenTV}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                🖥️ Abrir na TV
              </button>
              <button
                onClick={onEdit}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                title="Editar"
              >
                ✏️
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onEdit}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                ✏️ Editar
              </button>
              <button
                onClick={onOpenTV}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                title="Abrir na TV"
              >
                🖥️
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
