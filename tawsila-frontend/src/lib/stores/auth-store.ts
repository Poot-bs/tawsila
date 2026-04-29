'use client';

import { create } from 'zustand';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { SessionUser, UserRole } from '@/types';

interface AuthStore {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  /** Hydrate state from localStorage on app mount */
  hydrate: () => void;

  /** Set user session after login/register */
  setSession: (user: SessionUser, accessToken: string) => void;

  /** Clear session on logout */
  clearSession: () => void;

  /** Check if user has a specific role */
  hasRole: (role: UserRole) => boolean;

  /** Set loading state */
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  hydrate: () => {
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    try {
      const userJson = localStorage.getItem(STORAGE_KEYS.USER);
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (userJson && accessToken) {
        const user = JSON.parse(userJson) as SessionUser;
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setSession: (user, accessToken) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  clearSession: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  hasRole: (role) => {
    const { user } = get();
    return user?.role === role;
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
