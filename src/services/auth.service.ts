import type { ApiResponse } from '@/types/api';
import type { AuthResult, User } from '@/types/models';
import { api } from './api';

export interface RegisterPayload {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResult> {
    const res = await api.post<ApiResponse<AuthResult>>('/auth/register', payload);
    return res.data.data;
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const res = await api.post<ApiResponse<AuthResult>>('/auth/login', {
      email,
      password,
    });
    return res.data.data;
  },

  /** One call for both Google login and Google signup. */
  async google(idToken: string): Promise<AuthResult> {
    const res = await api.post<ApiResponse<AuthResult>>('/auth/google', { idToken });
    return res.data.data;
  },

  async me(): Promise<User> {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data.data.user;
  },

  async logout(refreshToken?: string | null): Promise<void> {
    await api.post('/auth/logout', refreshToken ? { refreshToken } : {});
  },

  async updateProfile(update: { fullName?: string; phone?: string }): Promise<User> {
    const res = await api.patch<ApiResponse<{ user: User }>>('/users/me', update);
    return res.data.data.user;
  },

  async updateBusiness(update: { name?: string; address?: string; phone?: string }) {
    const res = await api.patch<ApiResponse<{ business: { id: string; name: string } }>>(
      '/users/business',
      update
    );
    return res.data.data.business;
  },
};
