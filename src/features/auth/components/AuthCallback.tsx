import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../shared/utils/supabase'

export function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleCallback()
  }, [])

  async function handleCallback() {
    try {
      console.log('[AuthCallback] Starting callback handling')
      console.log('[AuthCallback] Current URL:', window.location.href)

      // Check for error in URL params
      const params = new URLSearchParams(window.location.search)
      const errorParam = params.get('error')
      const errorDescription = params.get('error_description')

      if (errorParam) {
        console.error('[AuthCallback] OAuth error:', errorParam, errorDescription)
        setError(errorDescription || errorParam)
        setTimeout(() => navigate('/login'), 2000)
        return
      }

      // Wait a moment for Supabase to process the auth hash
      await new Promise(resolve => setTimeout(resolve, 100))

      // Get the session after OAuth callback is processed
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('[AuthCallback] Session:', session?.user?.id, 'Error:', sessionError)

      if (!session?.user) {
        console.error('[AuthCallback] No session/user found after callback')
        setError('Authentication failed - no session')
        setTimeout(() => navigate('/login'), 2000)
        return
      }

      const user = session.user
      console.log('[AuthCallback] User authenticated:', user.id)

      // Check if user profile exists
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('box_id, boxes(slug)')
        .eq('id', user.id)
        .single<{ box_id: string; boxes: { slug: string } | null }>()

      console.log('[AuthCallback] User data:', userData, 'Error:', fetchError)

      if (fetchError || !userData) {
        // New user - redirect to onboarding
        console.log('[AuthCallback] New user, redirecting to onboarding')
        navigate('/onboarding')
        return
      }

      // Existing user - redirect to dashboard
      if (userData.boxes) {
        console.log('[AuthCallback] Existing user, redirecting to dashboard:', userData.boxes.slug)
        navigate(`/${userData.boxes.slug}/dashboard`)
      } else {
        console.log('[AuthCallback] No box found, redirecting to onboarding')
        navigate('/onboarding')
      }
    } catch (err) {
      console.error('[AuthCallback] Callback error:', err)
      setError('Something went wrong')
      setTimeout(() => navigate('/login'), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-red-500 text-xl">{error}</div>
            <div className="text-gray-400">Redirecting to login...</div>
          </>
        ) : (
          <>
            <div className="text-white text-xl">Signing you in...</div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </>
        )}
      </div>
    </div>
  )
}
