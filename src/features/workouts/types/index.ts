export interface Workout {
  id: string
  box_id: string
  owner_id: string
  slug: string
  name: string
  date: string
  tags: string[] | null
  is_template: boolean
  is_favorite?: boolean
  last_executed_at?: string | null
  total_duration: string | null
  created_at: string
  updated_at: string
  sections?: Section[]
}

export interface Section {
  id: string
  workout_id: string
  name: string
  order: number
  color: string | null
  repeat_count: number
  exclude_from_total: boolean
  exercises?: Exercise[]
}

export interface Exercise {
  id: string
  section_id: string
  name: string
  notes: string | null
  order: number
  rounds?: Round[]
}

export interface Round {
  id: string
  exercise_id: string
  duration: string // PostgreSQL interval format
  mode: 'countup' | 'countdown'
  color: string | null
  exclude_from_total: boolean
  order: number
}

export type TimerMode = 'countup' | 'countdown'

export interface TimerState {
  status: 'idle' | 'running' | 'paused' | 'completed'
  currentSectionIndex: number
  currentExerciseIndex: number
  currentRoundIndex: number
  elapsedTime: number
  startedAt: number | null
}
