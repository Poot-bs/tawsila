'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/stores/auth-store';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';
import { MobileNav } from './mobile-nav';
import { cn } from '@/lib/utils/cn';

function normalizePath(pathname: string) {
  if (pathname === '' || pathname === '/') return '/';
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

export function Header() {
  const t = useTranslations('nav');
  const { user, isAuthenticated, clearSession } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const path = normalizePath(pathname);

  const isLandingPage = path === '/';

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
  });

  const isSolid = scrolled || !isLandingPage;

  const handleLogout = async () => {
    try {
      const { authApi } = await import('@/lib/api');
      await authApi.logout();
    } catch {
      // ignore
    }
    clearSession();
    window.location.href = '/';
  };

  return (
    <motion.header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-in-out',
        isSolid
          ? 'bg-[var(--surface)]/90 backdrop-blur-xl border-b border-[var(--border)] shadow-sm py-2 sm:py-3'
          : 'bg-transparent border-transparent py-3 sm:py-5'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-14 items-center justify-between">
          <div className="flex-1 flex items-center justify-start">
            <Link href="/" className="flex items-center gap-3 group" aria-label="Tawsila Home">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1F7A8C] text-white shadow-lg shadow-[#1F7A8C]/30 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                  <path d="M15 18H9" />
                  <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                  <circle cx="17" cy="18" r="2" />
                  <circle cx="7" cy="18" r="2" />
                </svg>
              </div>
              <span
                className={cn(
                  'text-xl sm:text-2xl font-extrabold tracking-tight transition-colors duration-300',
                  isSolid ? 'text-[#022B3A]' : 'text-[var(--text)] lg:text-white'
                )}
              >
                Tawsila
              </span>
            </Link>
          </div>

          <nav
            className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-[#E1E5F2]/40 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-inner"
            aria-label="Main navigation"
          >
            <NavLink href="/trips" currentPath={path} isSolid={isSolid}>
              {t('trips')}
            </NavLink>
            {isAuthenticated && user?.role === 'CHAUFFEUR' && (
              <NavLink href="/trips/create" currentPath={path} isSolid={isSolid}>
                {t('driverSpace')}
              </NavLink>
            )}
            {isAuthenticated && (
              <>
                <NavLink href="/reservations" currentPath={path} isSolid={isSolid}>
                  {t('reservations')}
                </NavLink>
                <NavLink href="/notifications" currentPath={path} isSolid={isSolid}>
                  {t('notifications')}
                </NavLink>
                <NavLink href="/profile" currentPath={path} isSolid={isSolid}>
                  {t('profile')}
                </NavLink>
                {user?.role === 'PASSAGER' && (
                  <NavLink href="/payments" currentPath={path} isSolid={isSolid}>
                    {t('payments')}
                  </NavLink>
                )}
              </>
            )}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <NavLink href="/admin" currentPath={path} isSolid={isSolid}>
                {t('admin')}
              </NavLink>
            )}
          </nav>

          {/* Secondary Actions (Language, Theme, Auth) - Desktop Only */}
          <div className="hidden md:flex flex-1 items-center justify-end gap-3">
            <LanguageSwitcher />
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-3 ml-2 pl-3 border-l border-[#E1E5F2]">
                <span
                  className={cn(
                    'text-sm font-bold transition-colors duration-300',
                    isSolid ? 'text-[#022B3A]' : 'text-[var(--text)] lg:text-white/90'
                  )}
                >
                  {user?.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-bold bg-[#E1E5F2] hover:bg-red-100 text-[#022B3A] hover:text-red-700 px-5 py-2 rounded-full transition-colors"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-2 pl-3 border-l border-white/20">
                <Link href="/login">
                  <span
                    className={cn(
                      'inline-block text-sm font-bold px-5 py-2 rounded-full transition-colors cursor-pointer',
                      isSolid ? 'text-[#022B3A] hover:bg-[#E1E5F2]' : 'text-[var(--text)] lg:text-white lg:hover:bg-white/10'
                    )}
                  >
                    {t('login')}
                  </span>
                </Link>
                <Link href="/register">
                  <span className="inline-block text-sm font-bold bg-[#1F7A8C] hover:bg-[#155866] text-white px-6 py-2 rounded-full shadow-lg shadow-[#1F7A8C]/30 transition-all cursor-pointer">
                    {t('register')}
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center justify-end flex-1">
            <MobileNav />
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function NavLink({
  href,
  children,
  isSolid,
  currentPath,
}: {
  href: string;
  children: React.ReactNode;
  isSolid: boolean;
  currentPath: string;
}) {
  const isActive = href !== '/' && (currentPath === href || currentPath.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={cn(
        'relative px-5 py-2 text-sm font-bold rounded-full transition-all duration-300',
        isActive
          ? 'bg-[#1F7A8C] text-white shadow-md shadow-[#1F7A8C]/20'
          : isSolid
            ? 'text-[#022B3A]/70 hover:text-[#022B3A] hover:bg-white'
            : 'text-[var(--text-muted)] hover:text-primary hover:bg-primary/5 lg:text-white/80 lg:hover:text-white lg:hover:bg-white/20'
      )}
    >
      <span className="relative z-10">{children}</span>
    </Link>
  );
}
