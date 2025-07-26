export interface RegisterRequest {
  name: string;
  email: string;
  confirmEmail: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      phoneNumber?: string;
      role: string;
      createdAt: Date;
    };
    token: string;
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  type?: string;
}