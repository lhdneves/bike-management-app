'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Mail, Phone, Lock, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { RegisterFormData, FormErrors } from '../../types/auth';

export default function RegisterForm() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    confirmEmail: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Validation functions
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Confirm email validation
    if (!formData.confirmEmail) {
      newErrors.confirmEmail = 'Confirmação de email é obrigatória';
    } else if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = 'Emails não coincidem';
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phone && !/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Telefone deve ter entre 10 e 15 dígitos';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Senha deve ter ao menos: 1 minúscula, 1 maiúscula e 1 número';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    // Terms validation
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Você deve aceitar os termos e condições';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await register(formData);
      
      if (result.success) {
        router.push('/dashboard');
      } else {
        setSubmitError(result.message);
        
        // Handle field-specific errors
        if (result.errors) {
          const fieldErrors: FormErrors = {};
          result.errors.forEach((error: any) => {
            fieldErrors[error.field] = error.message;
          });
          setErrors(fieldErrors);
        }
      }
    } catch (error) {
      setSubmitError('Erro interno. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </button>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Criar Nova Conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <button
              onClick={() => router.push('/Auth/login')}
              className="font-medium text-orange-600 hover:text-orange-500"
            >
              faça login em sua conta existente
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {submitError && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{submitError}</div>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome Completo *
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-orange-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm bg-orange-50 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-colors ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-orange-200'
                }`}
                placeholder="Seu nome completo"
              />
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-orange-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm bg-orange-50 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-colors ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-orange-200'
                }`}
                placeholder="seu@email.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Confirm Email Field */}
          <div>
            <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700">
              Confirmar Email *
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-orange-400" />
              </div>
              <input
                id="confirmEmail"
                name="confirmEmail"
                type="email"
                required
                value={formData.confirmEmail}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm bg-orange-50 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-colors ${
                  errors.confirmEmail ? 'border-red-300 bg-red-50' : 'border-orange-200'
                }`}
                placeholder="Confirme seu email"
              />
            </div>
            {errors.confirmEmail && <p className="mt-1 text-sm text-red-600">{errors.confirmEmail}</p>}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Telefone (opcional)
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-orange-400" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm bg-orange-50 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-colors ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-orange-200'
                }`}
                placeholder="(11) 99999-9999"
              />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha *
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-orange-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm bg-orange-50 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-colors ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-orange-200'
                }`}
                placeholder="Sua senha"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-orange-400" />
                ) : (
                  <Eye className="h-5 w-5 text-orange-400" />
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar Senha *
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-orange-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm bg-orange-50 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-colors ${
                  errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-orange-200'
                }`}
                placeholder="Confirme sua senha"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-orange-400" />
                ) : (
                  <Eye className="h-5 w-5 text-orange-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={handleInputChange}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
              Eu aceito os{' '}
              <a href="#" className="text-orange-600 hover:text-orange-500">
                termos e condições
              </a>{' '}
              *
            </label>
          </div>
          {errors.acceptTerms && <p className="mt-1 text-sm text-red-600">{errors.acceptTerms}</p>}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando conta...
                </div>
              ) : (
                'Criar Conta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}