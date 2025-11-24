import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../../../shared/utils/supabase'

export function useAuth() {
  const { user, session, loading, boxId, role, setAuth, setUserProfile, clearAuth } = useAuthStore()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session?.user ?? null, session)

      // If user exists, fetch their profile
      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session?.user ?? null, session)

      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        clearAuth()
      }
    })

    return () => subscription.unsubscribe()
  }, [setAuth, setUserProfile, clearAuth])

  async function fetchUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('box_id, role')
      .eq('id', userId)
      .single<{ box_id: string; role: 'owner' | 'coach' | 'athlete' }>()

    if (data && !error) {
      setUserProfile(data.box_id, data.role)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    clearAuth()
  }

  return {
    user,
    session,
    loading,
    boxId,
    role,
    signOut,
    isAuthenticated: !!user,
    isOwner: role === 'owner',
    isCoach: role === 'coach' || role === 'owner',
  }
}
