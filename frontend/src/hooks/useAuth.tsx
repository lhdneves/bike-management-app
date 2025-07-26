'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User, LoginFormData, RegisterFormData } from '../types/auth';
import { authAPI } from '../utils/api';

interface AuthContextType extends AuthState {
  login: (data: LoginFormData) => Promise<{ success: boolean; message: string; errors?: any }>;
  register: (data: RegisterFormData) => Promise<{ success: boolean; message: string; errors?: any }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: 'SET_USER', payload: { user, token } });
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (data: LoginFormData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await authAPI.login(data);
      
      if (response.success && response.data) {
        // Store in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Update state
        dispatch({ 
          type: 'SET_USER', 
          payload: { 
            user: response.data.user, 
            token: response.data.token 
          } 
        });
        
        return { success: true, message: response.message };
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { 
          success: false, 
          message: response.message,
          errors: response.errors 
        };
      }
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed',
        errors: error.response?.data?.errors 
      };
    }
  };

  const register = async (data: RegisterFormData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await authAPI.register(data);
      
      if (response.success && response.data) {
        // Store in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Update state
        dispatch({ 
          type: 'SET_USER', 
          payload: { 
            user: response.data.user, 
            token: response.data.token 
          } 
        });
        
        return { success: true, message: response.message };
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
        return { 
          success: false, 
          message: response.message,
          errors: response.errors 
        };
      }
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}