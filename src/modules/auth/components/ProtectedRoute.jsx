/*import { Navigate } from 'react-router-dom';
import useAuth from '../hook/useAuth';

function ProtectedRoute({ children, redirectTo = '/login' }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;*/

import { Navigate } from 'react-router-dom';
import useAuth from '../hook/useAuth';

function ProtectedRoute({ children, redirectTo = '/login', role }) {
  const { isAuthenticated, authRole } = useAuth();

  if (!isAuthenticated || authRole !== role) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;