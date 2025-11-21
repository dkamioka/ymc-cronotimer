import { useState } from 'react'
import type { Workout } from '../types'

interface WorkoutLibraryProps {
  workouts: Workout[]
  selectedWorkout: Workout | null
  onSelectWorkout: (workout: Workout) => void
  onCreateWorkout: () => void
  onDuplicateWorkout?: (workout: Workout) => void
  onSaveAsTemplate?: (workout: Workout) => void
}

export function WorkoutLibrary({
  workouts,
  selectedWorkout,
  onSelectWorkout,
  onCreateWorkout,
  onDuplicateWorkout,
  onSaveAsTemplate
}: WorkoutLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'today' | 'past' | 'templates'>('all')

  const today = new Date().toISOString().split('T')[0]

  // Filter workouts based on search and filter type
  const filteredWorkouts = workouts.filter(workout => {
    // Search filter
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    // Type filter
    if (filterType === 'today') return workout.date === today && !workout.is_template
    if (filterType === 'past') return workout.date < today && !workout.is_template
    if (filterType === 'templates') return workout.is_template
    return true
  })

  const todayWorkouts = filteredWorkouts.filter(w => w.date === today && !w.is_template)
  const pastWorkouts = filteredWorkouts.filter(w => w.date < today && !w.is_template)
  const templates = filteredWorkouts.filter(w => w.is_template)

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Header with New Workout button */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onCreateWorkout}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors mb-3"
        >
          + Novo Treino
        </button>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar treinos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-2 border-b border-gray-700 bg-gray-850">
        {[
          { value: 'all', label: 'Todos' },
          { value: 'today', label: 'Hoje' },
          { value: 'past', label: 'Anteriores' },
          { value: 'templates', label: 'Templates' }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilterType(tab.value as typeof filterType)}
            className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
              filterType === tab.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* No results */}
        {filteredWorkouts.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <div className="text-sm">
              {searchQuery ? 'Nenhum treino encontrado' : 'Nenhum treino ainda'}
            </div>
          </div>
        )}

        {/* Today's Workouts */}
        {(filterType === 'all' || filterType === 'today') && todayWorkouts.length > 0 && (
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">
              Hoje
            </h3>
            {todayWorkouts.map(workout => (
              <WorkoutItem
                key={workout.id}
                workout={workout}
                isSelected={selectedWorkout?.id === workout.id}
                onSelect={() => onSelectWorkout(workout)}
                onDuplicate={onDuplicateWorkout}
                onSaveAsTemplate={onSaveAsTemplate}
              />
            ))}
          </div>
        )}

        {/* Past Workouts */}
        {(filterType === 'all' || filterType === 'past') && pastWorkouts.length > 0 && (
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">
              Anteriores
            </h3>
            {pastWorkouts.slice(0, filterType === 'past' ? 50 : 5).map(workout => (
              <WorkoutItem
                key={workout.id}
                workout={workout}
                isSelected={selectedWorkout?.id === workout.id}
                onSelect={() => onSelectWorkout(workout)}
                onDuplicate={onDuplicateWorkout}
                onSaveAsTemplate={onSaveAsTemplate}
                showDate
              />
            ))}
          </div>
        )}

        {/* Templates */}
        {(filterType === 'all' || filterType === 'templates') && templates.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">
              Templates
            </h3>
            {templates.map(workout => (
              <WorkoutItem
                key={workout.id}
                workout={workout}
                isSelected={selectedWorkout?.id === workout.id}
                onSelect={() => onSelectWorkout(workout)}
                onDuplicate={onDuplicateWorkout}
                isTemplate
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Workout item component with context menu
function WorkoutItem({
  workout,
  isSelected,
  onSelect,
  onDuplicate,
  onSaveAsTemplate,
  showDate,
  isTemplate
}: {
  workout: Workout
  isSelected: boolean
  onSelect: () => void
  onDuplicate?: (workout: Workout) => void
  onSaveAsTemplate?: (workout: Workout) => void
  showDate?: boolean
  isTemplate?: boolean
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="relative mb-1">
      <button
        onClick={onSelect}
        onContextMenu={(e) => {
          e.preventDefault()
          setShowMenu(!showMenu)
        }}
        className={`w-full text-left px-3 py-2 rounded transition-colors ${
          isSelected
            ? 'bg-blue-600 text-white'
            : 'hover:bg-gray-700 text-gray-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="font-medium">{workout.name}</div>
            {showDate && (
              <div className="text-xs text-gray-400 mt-1">
                {new Date(workout.date).toLocaleDateString('pt-BR')}
              </div>
            )}
            {isTemplate && workout.tags && workout.tags.length > 0 && (
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
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="ml-2 p-1 hover:bg-gray-600 rounded"
          >
            ⋮
          </button>
        </div>
      </button>

      {/* Context Menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-2 top-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-20 min-w-[160px]">
            {onDuplicate && (
              <button
                onClick={() => {
                  onDuplicate(workout)
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-600 transition-colors first:rounded-t-lg"
              >
                📋 Duplicar
              </button>
            )}
            {onSaveAsTemplate && !isTemplate && (
              <button
                onClick={() => {
                  onSaveAsTemplate(workout)
                  setShowMenu(false)
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-600 transition-colors last:rounded-b-lg"
              >
                ⭐ Salvar como Template
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
