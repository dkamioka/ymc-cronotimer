import { useEffect, useState } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../../../shared/utils/supabase'
import type { TimerState } from '../../workouts/types'

interface RemoteCommand {
  action: 'start' | 'pause' | 'resume' | 'skip' | 'previous'
  timestamp: number
}

interface TimerStateMessage {
  state: TimerState
  workout_id: string
  current_section: string | null
  current_exercise: string | null
  display_time: string
}

export function useRemoteControl(boxSlug: string) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [connected, setConnected] = useState(false)
  const [timerState, setTimerState] = useState<TimerStateMessage | null>(null)

  useEffect(() => {
    if (!boxSlug) return

    // Create a channel specific to this box
    const channelName = `box:${boxSlug}:timer`
    const newChannel = supabase.channel(channelName)

    // Subscribe to timer state updates from TV display
    newChannel
      .on('broadcast', { event: 'timer:state' }, (payload) => {
        setTimerState(payload.payload as TimerStateMessage)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true)
          console.log('Remote control connected to channel:', channelName)
        } else if (status === 'CLOSED') {
          setConnected(false)
          console.log('Remote control disconnected from channel:', channelName)
        } else if (status === 'CHANNEL_ERROR') {
          setConnected(false)
          console.error('Remote control channel error')
        }
      })

    setChannel(newChannel)

    // Cleanup on unmount
    return () => {
      newChannel.unsubscribe()
      setChannel(null)
      setConnected(false)
    }
  }, [boxSlug])

  async function sendCommand(action: RemoteCommand['action']) {
    if (!channel || !connected) {
      console.warn('Cannot send command: not connected')
      return false
    }

    try {
      const command: RemoteCommand = {
        action,
        timestamp: Date.now()
      }

      await channel.send({
        type: 'broadcast',
        event: 'timer:command',
        payload: command
      })

      console.log('Command sent:', action)
      return true
    } catch (error) {
      console.error('Error sending command:', error)
      return false
    }
  }

  return {
    connected,
    timerState,
    sendCommand
  }
}
