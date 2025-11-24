import { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Initialize auth - this sets up session persistence and auth state listeners
  useAuth()

  return <>{children}</>
}
