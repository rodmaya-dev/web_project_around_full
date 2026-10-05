// client/src/components/ProtectedRoute/ProtectedRoute.tsx

import { Navigate } from 'react-router-dom';
import type { AuthStatus } from '../../interfaces/AuthStatus';

interface ProtectedRouteProps {
  authStatus: AuthStatus;
  children: React.JSX.Element;
}

function ProtectedRoute({ authStatus, children }: ProtectedRouteProps): React.JSX.Element | null {
  // Mientras se verifica la sesión no sabemos nada: ni mostramos ni redirigimos
  if (authStatus === 'checking') {
    return null;
  }

  if (authStatus === 'guest') {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

export default ProtectedRoute;