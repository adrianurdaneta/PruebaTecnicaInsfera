/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Inicializar estado desde localStorage de forma síncrona para evitar setState dentro de useEffect
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = (userData, token) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
    } catch {}
    setUser(userData);
  };

  const logout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch {}
    setUser(null);
  };

  // Exponer una función para limpiar y redirigir desde la UI
  const logoutAndRedirect = () => {
    logout();
    try { window.location.href = '/login'; } catch {}
  };

  useEffect(() => {
    // Mantener loading en false (estado ya inicializado). Solo registramos listener global.
    const handleLogout = () => logout();
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, logoutAndRedirect, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de manera cómoda
export const useAuth = () => useContext(AuthContext);
