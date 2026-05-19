import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from './api';

const AuthContext = createContext();

// Configurar axios para credenciales (cookies)
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      const response = await axios.get(`${API_URL}/auth/me`);
      if (response.data.customer) {
        setUser(response.data.customer);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const login = async (identifier, password) => {
    try {
      setAuthError(null);
      const response = await axios.post(`${API_URL}/auth/login`, { identifier, password });
      if (response.data.customer) {
        setUser(response.data.customer);
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Error en el inicio de sesión');
      return false;
    }
  };

  const register = async (username, email, password, dni, address) => {
    try {
      setAuthError(null);
      await axios.post(`${API_URL}/auth/register`, { username, email, password, dni, address });
      return await login(username, password);
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Error en el registro');
      return false;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authChecked,
      authError,
      login,
      register,
      logout,
      checkUserAuth
    }}>
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
