'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils/cn';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('nav');
  const { user, isAuthenticated, clearSession } = useAuthStore();

  const handleLogout = async () => {
    try {
      const { authApi } = await import('@/lib/api');
      await authApi.logout();
    } catch {
      // Ignore
    }
    clearSession();
    setIsOpen(false);
    window.location.href = '/';
  };

  return (
    <>
      {/* Hamburger button */}
      <button
        type="button"
        className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] gap-1 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <span className={cn('w-4 h-0.5 bg-current transition-all duration-300', isOpen && 'rotate-45 translate-y-1.5')} />
        <span className={cn('w-4 h-0.5 bg-current transition-all duration-300', isOpen && 'opacity-0')} />
        <span className={cn('w-4 h-0.5 bg-current transition-all duration-300', isOpen && '-rotate-45 -translate-y-1.5')} />
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-[var(--bg)] animate-fade-up">
          <nav className="flex flex-col p-6 gap-2" aria-label="Mobile navigation">
            <MobileNavLink href="/trips" onClick={() => setIsOpen(false)}>{t('trips')}</MobileNavLink>
            {isAuthenticated && user?.role === 'CHAUFFEUR' && (
              <MobileNavLink href="/trips/create" onClick={() => setIsOpen(false)}>{t('driverSpace')}</MobileNavLink>
            )}
            {isAuthenticated && (
              <>
                <MobileNavLink href="/reservations" onClick={() => setIsOpen(false)}>{t('reservations')}</MobileNavLink>
                <MobileNavLink href="/notifications" onClick={() => setIsOpen(false)}>{t('notifications')}</MobileNavLink>
                <MobileNavLink href="/profile" onClick={() => setIsOpen(false)}>{t('profile')}</MobileNavLink>
                {user?.role === 'PASSAGER' && (
                  <MobileNavLink href="/payments" onClick={() => setIsOpen(false)}>{t('payments')}</MobileNavLink>
                )}
              </>
            )}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <MobileNavLink href="/admin" onClick={() => setIsOpen(false)}>{t('admin')}</MobileNavLink>
            )}

            <div className="border-t border-[var(--border)] my-4" />

            <div className="flex items-center gap-3 mb-4">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            {isAuthenticated ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-[var(--text-muted)]">{user?.name}</p>
                <Button variant="secondary" size="md" onClick={handleLogout} className="w-full">
                  {t('logout')}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="secondary" size="md" className="w-full">{t('login')}</Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">{t('register')}</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center px-4 py-3 text-base font-medium rounded-xl text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
    >
      {children}
    </Link>
  );
}
