import axios from 'axios';
import { AuthResponse, RegisterFormData, LoginFormData, ForgotPasswordFormData, ResetPasswordFormData } from '../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method
      });
    } else {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordFormData): Promise<AuthResponse> => {
    const response = await api.post('/password-reset/request', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordFormData): Promise<AuthResponse> => {
    const response = await api.post('/password-reset/reset', {
      token: data.token,
      newPassword: data.password
    });
    return response.data;
  },

  validateResetToken: async (token: string): Promise<AuthResponse> => {
    const response = await api.get(`/password-reset/validate/${token}`);
    return response.data;
  },
};

export default api;