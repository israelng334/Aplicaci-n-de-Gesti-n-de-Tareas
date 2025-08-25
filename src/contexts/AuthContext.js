import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

// Crear el contexto de autenticación
const AuthContext = createContext();

/**
 * Hook personalizado para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

/**
 * Proveedor del contexto de autenticación
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Verifica si hay un token válido al cargar la aplicación
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const userProfile = await apiService.getProfile();
          setUser(userProfile);
        } catch (error) {
          console.error('Error al verificar autenticación:', error);
          apiService.clearToken();
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Inicia sesión del usuario
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiService.login(email, password);
      setUser(response.user);
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra un nuevo usuario
   */
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiService.register(userData);
      setUser(response.user);
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cierra la sesión del usuario
   */
  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  /**
   * Actualiza el perfil del usuario
   */
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      // Intentar /profile; si no existe, usar /users/:id
      let updatedUser;
      try {
        updatedUser = await apiService.updateProfile(profileData);
      } catch (e) {
        if (user?.id) {
          updatedUser = await apiService.updateUser(user.id, profileData);
        } else {
          throw e;
        }
      }
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  /**
   * Limpia los errores
   */
  const clearError = () => {
    setError(null);
  };

  // Valor del contexto
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
