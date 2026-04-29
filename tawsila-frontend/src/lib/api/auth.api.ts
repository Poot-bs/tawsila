import { apiClient } from './client';
import type { LoginRequest, LoginResponse, MeResponse, RegisterRequest, User } from '@/types';

export const authApi = {
  /** Register a new user */
  register(data: RegisterRequest) {
    return apiClient.post<User>('/auth/register', data);
  },

  /** Login and receive JWT tokens */
  login(data: LoginRequest) {
    return apiClient.post<LoginResponse>('/auth/login', data);
  },

  /** Logout current session */
  logout() {
    return apiClient.post<{ status: string }>('/auth/logout');
  },

  /** Get current user from token */
  me() {
    return apiClient.get<MeResponse>('/auth/me');
  },

  /** List all users (admin) */
  users() {
    return apiClient.get<User[]>('/auth/users');
  },
};
