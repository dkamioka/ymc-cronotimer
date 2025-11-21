import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  boxId: string | null
  role: 'owner' | 'coach' | 'athlete' | null
  setAuth: (user: User | null, session: Session | null) => void
  setUserProfile: (boxId: string, role: 'owner' | 'coach' | 'athlete') => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  boxId: null,
  role: null,
  setAuth: (user, session) => set({ user, session, loading: false }),
  setUserProfile: (boxId, role) => set({ boxId, role }),
  clearAuth: () => set({
    user: null,
    session: null,
    loading: false,
    boxId: null,
    role: null
  }),
}))
