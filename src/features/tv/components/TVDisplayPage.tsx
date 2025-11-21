import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../../shared/utils/supabase'
import { useTimer } from '../hooks/useTimer'
import { useTimerBroadcast } from '../hooks/useTimerBroadcast'
import type { Workout } from '../../workouts/types'

export function TVDisplayPage() {
  const { slug, workoutId } = useParams<{ slug: string; workoutId: string }>()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<HTMLDivElement>(null)

  const {
    state,
    currentSection,
    currentExercise,
    nextRound,
    displayTime,
    progress,
    start,
    pause,
    resume,
    skip,
    previous
  } = useTimer(workout)

  // Broadcast timer state to remote controls and receive commands
  useTimerBroadcast({
    boxSlug: slug || '',
    workoutId: workoutId || '',
    state,
    currentSection,
    currentExercise,
    displayTime,
    onCommand: (action) => {
      switch (action) {
        case 'start':
          start()
          break
        case 'pause':
          pause()
          break
        case 'resume':
          resume()
          break
        case 'skip':
          skip()
          break
        case 'previous':
          previous()
          break
      }
    }
  })

  useEffect(() => {
    loadWorkout()
  }, [workoutId])

  async function loadWorkout() {
    if (!workoutId) return

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
        .eq('id', workoutId)
        .single()

      if (error) throw error
      setWorkout(data as any)
    } catch (error) {
      console.error('Error loading workout:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-4xl">Carregando...</div>
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-4xl">Treino não encontrado</div>
      </div>
    )
  }

  const backgroundColor = currentSection?.color || '#212529'
  const isRunning = state.status === 'running'
  const isPaused = state.status === 'paused'
  const isCompleted = state.status === 'completed'

  return (
    <div
      className="min-h-screen flex flex-col text-white transition-colors duration-700"
      style={{ backgroundColor }}
    >
      {/* Header - 5% */}
      <div className="h-[5vh] flex items-center justify-between px-8 bg-black/20">
        <div className="text-2xl font-bold">{slug?.toUpperCase()}</div>
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-white/50"></div>
          <div className="w-3 h-3 rounded-full bg-white/50"></div>
          <div className="w-3 h-3 rounded-full bg-white/50"></div>
        </div>
      </div>

      {/* Section Name - 10% */}
      <div className="h-[10vh] flex items-center justify-center">
        <h1 className="text-[8vh] font-semibold uppercase tracking-wider">
          {currentSection?.name || 'Aguardando'}
        </h1>
      </div>

      {/* Timer - 50% */}
      <div ref={timerRef} className="h-[50vh] flex items-center justify-center">
        {isCompleted ? (
          <div className="text-center">
            <div className="text-[20vh] font-bold mb-4">🎉</div>
            <div className="text-[10vh] font-bold">COMPLETO!</div>
          </div>
        ) : (
          <div className="text-[30vh] font-bold font-mono tracking-tight drop-shadow-2xl">
            {displayTime}
          </div>
        )}
      </div>

      {/* Progress Bar - 10% */}
      <div className="h-[10vh] flex items-center px-8">
        <div className="w-full h-4 bg-black/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Next Preview - 10% */}
      <div className="h-[10vh] flex items-center justify-center px-8">
        {nextRound && !isCompleted && (
          <div className="text-[4vh] opacity-90">
            PRÓXIMO: {nextRound.section} - {nextRound.exercise}{' '}
            ({formatDuration(nextRound.duration)})
          </div>
        )}
      </div>

      {/* Controls - 15% */}
      <div className="h-[15vh] flex items-center justify-center gap-6 pb-8">
        <button
          onClick={previous}
          disabled={state.currentRoundIndex === 0}
          className="px-8 py-4 bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-[3vh] font-semibold transition-colors"
        >
          ⏮ VOLTAR
        </button>

        {state.status === 'idle' && (
          <button
            onClick={start}
            className="px-12 py-4 bg-white text-black hover:bg-white/90 rounded-xl text-[3vh] font-bold transition-colors"
          >
            ▶ INICIAR
          </button>
        )}

        {isRunning && (
          <button
            onClick={pause}
            className="px-12 py-4 bg-white text-black hover:bg-white/90 rounded-xl text-[3vh] font-bold transition-colors"
          >
            ⏸ PAUSAR
          </button>
        )}

        {isPaused && (
          <button
            onClick={resume}
            className="px-12 py-4 bg-white text-black hover:bg-white/90 rounded-xl text-[3vh] font-bold transition-colors"
          >
            ▶ CONTINUAR
          </button>
        )}

        <button
          onClick={skip}
          disabled={isCompleted}
          className="px-8 py-4 bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-[3vh] font-semibold transition-colors"
        >
          ⏭ PULAR
        </button>
      </div>
    </div>
  )
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
