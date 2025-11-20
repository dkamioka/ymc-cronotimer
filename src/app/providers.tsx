import { ReactNode } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

interface ProvidersProps {
  children?: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <RouterProvider router={router} />;
}
