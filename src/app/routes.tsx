import { createBrowserRouter } from 'react-router-dom';
import { LoginPage } from '../features/auth/components/LoginPage';
import { AuthCallback } from '../features/auth/components/AuthCallback';
import { OnboardingPage } from '../features/auth/components/OnboardingPage';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { DashboardPage } from '../features/dashboard/components/DashboardPage';
import { WorkoutEditorPage } from '../features/workouts/components/WorkoutEditorPage';
import { TVDisplayPage } from '../features/tv/components/TVDisplayPage';
import { RemoteControlPage } from '../features/remote/components/RemoteControlPage';

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
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'editor',
        element: (
          <ProtectedRoute requiredRole="coach">
            <WorkoutEditorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'tv/:workoutId',
        element: (
          <ProtectedRoute>
            <TVDisplayPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'remote',
        element: (
          <ProtectedRoute>
            <RemoteControlPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
