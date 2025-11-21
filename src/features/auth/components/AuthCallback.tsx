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
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Authentication failed')
        setTimeout(() => navigate('/login'), 2000)
        return
      }

      // Check if user profile exists
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('box_id, boxes(slug)')
        .eq('id', user.id)
        .single<{ box_id: string; boxes: { slug: string } | null }>()

      if (fetchError || !userData) {
        // New user - redirect to onboarding
        navigate('/onboarding')
        return
      }

      // Existing user - redirect to dashboard
      if (userData.boxes) {
        navigate(`/${userData.boxes.slug}/dashboard`)
      } else {
        navigate('/onboarding')
      }
    } catch (err) {
      console.error('Callback error:', err)
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
