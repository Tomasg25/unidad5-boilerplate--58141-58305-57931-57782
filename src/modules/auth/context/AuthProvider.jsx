import { createContext, useState } from 'react';
import { loginAdmin } from '../services/adminLogin';
import { loginPatient } from '../services/patientLogin';

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    return Boolean(token);
  });

  const [role, setRole] = useState(() => {
    const role = localStorage.getItem('role');
    return role;
  });

  const singout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setRole(null);
  };

  const setAuthSession = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    setIsAuthenticated(true);
    setRole(data.role);
  };

  const singinAdmin = async (email, password) => {
    const { data, error } = await loginAdmin(email, password);

    if (error) {
      return { error };
    }

    setAuthSession(data);
    return { error: null };
  };

  const singinPatient = async (email, dni) => {
    const { data, error } = await loginPatient(email, dni);

    if (error) {
      return { error };
    }

    localStorage.setItem('patientDni', dni);
    localStorage.setItem('patientEmail', email)
    setAuthSession(data);
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authRole: role,
        singinAdmin,
        singinPatient,
        singout,
        setAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider, AuthContext };