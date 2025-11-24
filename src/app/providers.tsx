import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { ErrorBoundary } from '../shared/components/ErrorBoundary'
import { AuthProvider } from '../features/auth/components/AuthProvider'

export function Providers() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  )
}
