import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { ErrorBoundary } from '../shared/components/ErrorBoundary'

export function Providers() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}
