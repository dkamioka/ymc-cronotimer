import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'owner' | 'coach' | 'athlete'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { loading, isAuthenticated, role } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && role !== requiredRole && role !== 'owner') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Access denied</div>
      </div>
    )
  }

  return <>{children}</>
}
