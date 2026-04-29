'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ROLE_ROUTES } from '@/lib/utils/constants';

interface AuthGuardProps {
  children: React.ReactNode;
}

function isRouteAllowed(strippedPath: string, allowedRoutes: string[]): boolean {
  const normalized = strippedPath === '' ? '/' : strippedPath.startsWith('/') ? strippedPath : `/${strippedPath}`;
  return allowedRoutes.some((route) => {
    if (route === '/') {
      return normalized === '/' || normalized === '';
    }
    return normalized === route || normalized.startsWith(`${route}/`);
  });
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (user?.role) {
        const normalizedPath = pathname === '' ? '/' : pathname.startsWith('/') ? pathname : `/${pathname}`;
        const allowedRoutes = ROLE_ROUTES[user.role] || [];
        const isAllowed = isRouteAllowed(normalizedPath, allowedRoutes);

        if (!isAllowed && normalizedPath !== '/') {
          router.replace('/');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
