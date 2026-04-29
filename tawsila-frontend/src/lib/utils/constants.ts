import type { UserRole } from '@/types';

/** Default locale for the application */
export const DEFAULT_LOCALE = 'fr' as const;

/** Supported locales */
export const LOCALES = ['fr', 'en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

/** RTL locales */
export const RTL_LOCALES: Locale[] = ['ar'];

/** Role-based home routes */
export const ROLE_HOME: Record<UserRole, string> = {
  PASSAGER: '/trips',
  CHAUFFEUR: '/trips/create',
  ADMIN: '/admin',
};

/** Public routes that don't require authentication */
export const PUBLIC_ROUTES = ['/', '/login', '/register'];

/** Routes restricted by role */
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  PASSAGER: [
    '/',
    '/trips',
    '/reservations',
    '/notifications',
    '/chat',
    '/payments',
    '/profile',
  ],
  CHAUFFEUR: [
    '/',
    '/trips',
    '/trips/create',
    '/reservations',
    '/notifications',
    '/chat',
    '/payments',
    '/profile',
  ],
  ADMIN: [
    '/',
    '/admin',
    '/admin/users',
    '/notifications',
    '/profile',
  ],
};

/** API base URL — resolved from environment */
export const API_BASE_URL = (() => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  
  if (envUrl) {
    const resolved = envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
    if (typeof window !== 'undefined') {
      console.log('[DEBUG] API Base URL (env):', resolved);
    }
    return resolved;
  }
  
  const fallback = typeof window !== 'undefined' ? '/api' : 'http://localhost:8080/api';
  if (typeof window !== 'undefined') {
    console.warn('[DEBUG] API Base URL (fallback):', fallback);
  }
  return fallback;
})();

/** WebSocket URL */
export const WS_URL = (() => {
  const envWs = process.env.NEXT_PUBLIC_WS_URL;
  if (envWs) return envWs;

  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envUrl) {
    // Derive ws:// or wss:// from http:// or https://
    const wsBase = envUrl.replace(/^http/, 'ws').replace(/\/api$/, '');
    return `${wsBase.replace(/\/$/, '')}/ws`;
  }

  return 'ws://localhost:8080/ws';
})();

/** Application name */
export const APP_NAME = 'Tawsila';

/** Local storage keys */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'tawsila_access_token',
  USER: 'tawsila_user',
  LOCALE: 'tawsila_locale',
  THEME: 'tawsila_theme',
  READ_NOTIFICATIONS: 'tawsila_read_notifications',
} as const;
