import api from './axios';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: 'USER' | 'ADMIN';
    };
  };
}

export const authApi = {
  login: (payload: LoginPayload): Promise<AuthResponse> => api.post('/auth/login', payload),
  register: (payload: RegisterPayload): Promise<AuthResponse> => api.post('/auth/register', payload),
};
