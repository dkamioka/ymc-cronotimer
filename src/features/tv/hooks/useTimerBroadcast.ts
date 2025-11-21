import { useEffect, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../../../shared/utils/supabase'
import type { TimerState } from '../../workouts/types'

interface RemoteCommand {
  action: 'start' | 'pause' | 'resume' | 'skip' | 'previous'
  timestamp: number
}

interface TimerBroadcastOptions {
  boxSlug: string
  workoutId: string
  state: TimerState
  currentSection: { name: string; color: string } | null
  currentExercise: string | null
  displayTime: string
  onCommand: (action: RemoteCommand['action']) => void
}

export function useTimerBroadcast({
  boxSlug,
  workoutId,
  state,
  currentSection,
  currentExercise,
  displayTime,
  onCommand
}: TimerBroadcastOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const lastBroadcastRef = useRef<string>('')

  // Subscribe to remote commands
  useEffect(() => {
    if (!boxSlug) return

    const channelName = `box:${boxSlug}:timer`
    const channel = supabase.channel(channelName)

    // Listen for commands from remote control
    channel
      .on('broadcast', { event: 'timer:command' }, (payload) => {
        const command = payload.payload as RemoteCommand
        console.log('Received remote command:', command.action)
        onCommand(command.action)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('TV display connected to channel:', channelName)
        }
      })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [boxSlug, onCommand])

  // Broadcast timer state updates
  useEffect(() => {
    if (!channelRef.current || !workoutId) return

    // Create a snapshot of current state
    const stateSnapshot = {
      state,
      workout_id: workoutId,
      current_section: currentSection?.name || null,
      current_exercise: currentExercise,
      display_time: displayTime
    }

    // Only broadcast if something changed (avoid spam)
    const stateKey = JSON.stringify(stateSnapshot)
    if (stateKey === lastBroadcastRef.current) return
    lastBroadcastRef.current = stateKey

    // Broadcast state to remote controls
    channelRef.current.send({
      type: 'broadcast',
      event: 'timer:state',
      payload: stateSnapshot
    })
  }, [state, workoutId, currentSection, currentExercise, displayTime])
}
