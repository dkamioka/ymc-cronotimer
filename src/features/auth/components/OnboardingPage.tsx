import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../shared/utils/supabase'
import { nanoid } from 'nanoid'

export function OnboardingPage() {
  const [boxName, setBoxName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already onboarded
    checkOnboarding()
  }, [])

  async function checkOnboarding() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    // Set user name from Google profile
    setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '')

    // Check if user already has a box
    const { data } = await supabase
      .from('users')
      .select('box_id, boxes(slug)')
      .eq('id', user.id)
      .single<{ box_id: string; boxes: { slug: string } | null }>()

    if (data?.boxes) {
      // Already onboarded, redirect to dashboard
      navigate(`/${data.boxes.slug}/dashboard`)
    }
  }

  async function handleCreateBox(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      // Generate a unique slug
      const slug = boxName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + nanoid(6)

      // Create the box
      const { data: box, error: boxError } = await supabase
        .from('boxes')
        .insert({ name: boxName, slug } as any)
        .select()
        .single<{ id: string; name: string; slug: string }>()

      if (boxError) throw boxError

      // Create the user profile
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          name: userName,
          box_id: box!.id,
          role: 'owner'
        } as any)

      if (userError) throw userError

      // Redirect to dashboard
      navigate(`/${slug}/dashboard`)
    } catch (err: any) {
      console.error('Onboarding error:', err)
      setError(err.message || 'Failed to create box')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white text-center">
            Welcome to YMC Cronotimer!
          </h1>
          <p className="mt-2 text-center text-gray-400">
            Let's set up your CrossFit box
          </p>
        </div>

        <form onSubmit={handleCreateBox} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-300">
                Your Name
              </label>
              <input
                id="userName"
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="boxName" className="block text-sm font-medium text-gray-300">
                Box Name
              </label>
              <input
                id="boxName"
                type="text"
                required
                value={boxName}
                onChange={(e) => setBoxName(e.target.value)}
                placeholder="e.g., CrossFit Downtown"
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                This is the name of your CrossFit gym or box
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create My Box'}
          </button>
        </form>
      </div>
    </div>
  )
}
