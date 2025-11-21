import type { Workout } from '../types'

interface WorkoutLibraryProps {
  workouts: Workout[]
  selectedWorkout: Workout | null
  onSelectWorkout: (workout: Workout) => void
  onCreateWorkout: () => void
}

export function WorkoutLibrary({
  workouts,
  selectedWorkout,
  onSelectWorkout,
  onCreateWorkout
}: WorkoutLibraryProps) {
  const today = new Date().toISOString().split('T')[0]
  const todayWorkouts = workouts.filter(w => w.date === today)
  const pastWorkouts = workouts.filter(w => w.date < today)
  const templates = workouts.filter(w => w.is_template)

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onCreateWorkout}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          + Novo Treino
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Today's Workouts */}
        {todayWorkouts.length > 0 && (
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">
              Hoje
            </h3>
            {todayWorkouts.map(workout => (
              <button
                key={workout.id}
                onClick={() => onSelectWorkout(workout)}
                className={`w-full text-left px-3 py-2 rounded mb-1 transition-colors ${
                  selectedWorkout?.id === workout.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                <div className="font-medium">{workout.name}</div>
                {workout.total_duration && (
                  <div className="text-xs text-gray-400 mt-1">
                    {workout.total_duration}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Past Workouts */}
        {pastWorkouts.length > 0 && (
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">
              Anteriores
            </h3>
            {pastWorkouts.slice(0, 5).map(workout => (
              <button
                key={workout.id}
                onClick={() => onSelectWorkout(workout)}
                className={`w-full text-left px-3 py-2 rounded mb-1 transition-colors ${
                  selectedWorkout?.id === workout.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                <div className="font-medium">{workout.name}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(workout.date).toLocaleDateString('pt-BR')}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Templates */}
        {templates.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">
              Templates
            </h3>
            {templates.map(workout => (
              <button
                key={workout.id}
                onClick={() => onSelectWorkout(workout)}
                className={`w-full text-left px-3 py-2 rounded mb-1 transition-colors ${
                  selectedWorkout?.id === workout.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                <div className="font-medium">{workout.name}</div>
                {workout.tags && workout.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {workout.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
