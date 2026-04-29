export type UserRole = 'PASSAGER' | 'CHAUFFEUR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';

export interface User {
  identifiant: string;
  nom: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  userId: string;
  role: UserRole;
  name: string;
  email: string;
}

export interface MeResponse {
  userId: string;
  role: UserRole;
  name: string;
  email: string;
  status: UserStatus;
}

export interface AuthState {
  user: SessionUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SessionUser {
  userId: string;
  role: UserRole;
  name: string;
  email: string;
}
