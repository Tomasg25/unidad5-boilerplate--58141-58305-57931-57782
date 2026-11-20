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

/*import { Navigate } from 'react-router-dom';
import useAuth from '../hook/useAuth';

function ProtectedRoute({ children, redirectTo = '/login', role }) {
  const { isAuthenticated, authRole } = useAuth();

  if (!isAuthenticated || authRole !== role) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute; */

import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hook/useAuth';

const HOME_BY_ROLE = {
  Administrador: '/admin/home',
  Paciente: '/',
};

function ProtectedRoute({ children, redirectTo = '/login', role }) {
  const { isAuthenticated, authRole } = useAuth();
  const [countdown, setCountdown] = useState(3);

  const isWrongRole = isAuthenticated && authRole !== role;

  useEffect(() => {
    if (!isWrongRole) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isWrongRole]);

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (isWrongRole) {
    const destination = HOME_BY_ROLE[authRole] || '/';

    if (countdown <= 0) {
      return <Navigate to={destination} replace />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Acceso No Autorizado
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            No tenés permisos para acceder a esta sección.
          </p>
          <p className="text-xs text-gray-400">
            Redirigiendo en{' '}
            <span className="font-bold text-gray-700">{countdown}</span>{' '}
            segundo{countdown !== 1 ? 's' : ''}...
          </p>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;