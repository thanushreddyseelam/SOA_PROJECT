import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('urbanglide_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('urbanglide_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      if (token) {
        try {
          const validated = await authService.validateToken();
          if (validated && validated.username) {
            const updatedUser = {
              username: validated.username,
              role: validated.role,
              userId: validated.userId || user?.userId,
              email: validated.email || user?.email
            };
            setUser(updatedUser);
            localStorage.setItem('urbanglide_user', JSON.stringify(updatedUser));
          }
        } catch {
          // Token invalid or expired
          logout();
        }
      }
      setLoading(false);
    };

    checkToken();

    // Listen for session expired events
    const handleSessionExpired = () => {
      logout();
    };
    window.addEventListener('urbanglide:session_expired', handleSessionExpired);
    return () => window.removeEventListener('urbanglide:session_expired', handleSessionExpired);
  }, [token]);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setToken(data.token);
    const userData = {
      username: data.username,
      role: data.role,
      userId: data.userId,
      email: data.email
    };
    setUser(userData);
    localStorage.setItem('urbanglide_token', data.token);
    localStorage.setItem('urbanglide_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (username, email, password) => {
    const data = await authService.register(username, email, password);
    setToken(data.token);
    const userData = {
      username: data.username,
      role: data.role,
      userId: data.userId,
      email: data.email
    };
    setUser(userData);
    localStorage.setItem('urbanglide_token', data.token);
    localStorage.setItem('urbanglide_user', JSON.stringify(userData));
    return userData;
  };

  const registerDriver = async (username, email, password) => {
    const data = await authService.registerDriver(username, email, password);
    setToken(data.token);
    const userData = {
      username: data.username,
      role: data.role,
      userId: data.userId,
      email: data.email
    };
    setUser(userData);
    localStorage.setItem('urbanglide_token', data.token);
    localStorage.setItem('urbanglide_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('urbanglide_token');
    localStorage.removeItem('urbanglide_user');
  };

  const isDriver = user?.role === 'DRIVER';
  const isRider = user?.role === 'RIDER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        register,
        registerDriver,
        logout,
        isAuthenticated: !!token,
        isDriver,
        isRider,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
