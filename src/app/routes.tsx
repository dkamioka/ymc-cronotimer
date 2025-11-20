import { createBrowserRouter } from 'react-router-dom';
import App from './App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/:boxSlug',
    children: [
      {
        path: 'dashboard',
        element: <div>Dashboard</div>,
      },
      {
        path: 'editor/:workoutSlug?',
        element: <div>Editor</div>,
      },
      {
        path: 'tv/:workoutSlug',
        element: <div>TV Mode</div>,
      },
      {
        path: 'remote/:sessionCode',
        element: <div>Remote Control</div>,
      },
    ],
  },
]);
