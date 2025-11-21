import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../features/auth/components/LoginPage';
import { AuthCallback } from '../features/auth/components/AuthCallback';
import { OnboardingPage } from '../features/auth/components/OnboardingPage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },
  {
    path: '/:boxSlug',
    children: [
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <div className="text-white p-8 min-h-screen bg-gray-900">Dashboard (coming soon)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'editor/:workoutSlug?',
        element: (
          <ProtectedRoute requiredRole="coach">
            <div className="text-white p-8 min-h-screen bg-gray-900">Editor (coming soon)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'tv/:workoutSlug',
        element: (
          <ProtectedRoute>
            <div className="text-white p-8 min-h-screen bg-gray-900">TV Mode (coming soon)</div>
          </ProtectedRoute>
        ),
      },
      {
        path: 'remote/:sessionCode',
        element: (
          <ProtectedRoute>
            <div className="text-white p-8 min-h-screen bg-gray-900">Remote Control (coming soon)</div>
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
