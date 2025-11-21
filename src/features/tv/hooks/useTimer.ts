import { useState, useEffect, useRef, useCallback } from 'react'
import type { Workout, Section, Exercise, Round, TimerState } from '../../workouts/types'

interface FlatRound {
  section: string
  sectionColor: string
  exercise: string
  round: Round
  sectionIndex: number
  exerciseIndex: number
  roundIndex: number
}

export function useTimer(workout: Workout | null) {
  const [state, setState] = useState<TimerState>({
    status: 'idle',
    currentSectionIndex: 0,
    currentExerciseIndex: 0,
    currentRoundIndex: 0,
    elapsedTime: 0,
    startedAt: null
  })

  const intervalRef = useRef<number | null>(null)
  const flatRounds = useRef<FlatRound[]>([])

  // Flatten workout into linear sequence of rounds
  useEffect(() => {
    if (!workout) return

    const flat: FlatRound[] = []
    workout.sections?.forEach((section, sIdx) => {
      const repeatCount = section.repeat_count || 1
      for (let rep = 0; rep < repeatCount; rep++) {
        section.exercises?.forEach((exercise, eIdx) => {
          exercise.rounds?.forEach((round, rIdx) => {
            flat.push({
              section: section.name,
              sectionColor: section.color || '#212529',
              exercise: exercise.name,
              round,
              sectionIndex: sIdx,
              exerciseIndex: eIdx,
              roundIndex: rIdx
            })
          })
        })
      }
    })
    flatRounds.current = flat
  }, [workout])

  const currentFlatIndex = state.currentRoundIndex
  const currentFlat = flatRounds.current[currentFlatIndex]
  const totalRounds = flatRounds.current.length

  // Timer tick
  useEffect(() => {
    if (state.status !== 'running') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = window.setInterval(() => {
      setState(prev => {
        const now = Date.now()
        const elapsed = prev.startedAt ? Math.floor((now - prev.startedAt) / 1000) : 0

        // Check if current round is complete (for countdown mode)
        const currentRound = flatRounds.current[prev.currentRoundIndex]
        if (currentRound) {
          const duration = parseDuration(currentRound.round.duration)
          if (currentRound.round.mode === 'countdown' && elapsed >= duration) {
            // Auto-advance to next round
            const nextIndex = prev.currentRoundIndex + 1
            if (nextIndex >= flatRounds.current.length) {
              // Workout complete
              return {
                ...prev,
                status: 'completed',
                startedAt: null
              }
            }
            // Move to next round
            return {
              ...prev,
              currentRoundIndex: nextIndex,
              elapsedTime: 0,
              startedAt: now
            }
          }
        }

        return {
          ...prev,
          elapsedTime: elapsed
        }
      })
    }, 100) // Update every 100ms for smooth display

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [state.status])

  const start = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'running',
      startedAt: Date.now()
    }))
  }, [])

  const pause = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'paused',
      startedAt: null
    }))
  }, [])

  const resume = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'running',
      startedAt: Date.now() - (prev.elapsedTime * 1000)
    }))
  }, [])

  const skip = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentRoundIndex + 1
      if (nextIndex >= flatRounds.current.length) {
        return {
          ...prev,
          status: 'completed',
          startedAt: null
        }
      }
      return {
        ...prev,
        currentRoundIndex: nextIndex,
        elapsedTime: 0,
        startedAt: prev.status === 'running' ? Date.now() : null
      }
    })
  }, [])

  const previous = useCallback(() => {
    setState(prev => {
      const prevIndex = Math.max(0, prev.currentRoundIndex - 1)
      return {
        ...prev,
        currentRoundIndex: prevIndex,
        elapsedTime: 0,
        startedAt: prev.status === 'running' ? Date.now() : null
      }
    })
  }, [])

  // Calculate display time
  let displayTime = '00:00'
  if (currentFlat) {
    const duration = parseDuration(currentFlat.round.duration)
    if (currentFlat.round.mode === 'countdown') {
      const remaining = Math.max(0, duration - state.elapsedTime)
      displayTime = formatTime(remaining)
    } else {
      displayTime = formatTime(state.elapsedTime)
    }
  }

  // Calculate progress
  const progress = totalRounds > 0 ? currentFlatIndex / totalRounds : 0

  // Get next round info
  const nextFlat = flatRounds.current[currentFlatIndex + 1]

  return {
    state,
    currentSection: currentFlat ? { name: currentFlat.section, color: currentFlat.sectionColor } : null,
    currentExercise: currentFlat?.exercise || null,
    currentRound: currentFlat?.round || null,
    nextRound: nextFlat ? {
      section: nextFlat.section,
      exercise: nextFlat.exercise,
      duration: nextFlat.round.duration
    } : null,
    displayTime,
    progress,
    start,
    pause,
    resume,
    skip,
    previous
  }
}

function parseDuration(duration: string): number {
  const parts = duration.split(':')
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
  }
  return 0
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
