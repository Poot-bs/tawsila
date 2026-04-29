import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('nav');
  const { user, isAuthenticated, clearSession } = useAuthStore();

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

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
        className="md:hidden relative z-[60] flex flex-col items-center justify-center w-11 h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <div className="w-5 flex flex-col gap-1.5">
          <span className={cn('h-0.5 bg-[var(--text)] transition-all duration-300 origin-right', isOpen ? 'w-5 -rotate-45 -translate-y-px' : 'w-5')} />
          <span className={cn('h-0.5 bg-[var(--text)] transition-all duration-300', isOpen ? 'opacity-0' : 'w-3 self-end')} />
          <span className={cn('h-0.5 bg-[var(--text)] transition-all duration-300 origin-right', isOpen ? 'w-5 rotate-45 translate-y-px' : 'w-4 self-end')} />
        </div>
      </button>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            />

            {/* Side Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 h-full w-[85%] max-w-[320px] bg-[var(--surface)] shadow-2xl md:hidden flex flex-col"
            >
              <div className="p-6 pt-24 flex-1 overflow-y-auto">
                <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                  <MobileNavLink href="/trips" onClick={() => setIsOpen(false)} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7l5-2.5 5.553 2.776a1 1 0 01.447.894v10.764a1 1 0 01-1.447.894L14 17l-5 3z" /></svg>}>{t('trips')}</MobileNavLink>
                  {isAuthenticated && user?.role === 'CHAUFFEUR' && (
                    <MobileNavLink href="/trips/create" onClick={() => setIsOpen(false)} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>}>{t('driverSpace')}</MobileNavLink>
                  )}
                  
                  {isAuthenticated && (
                    <>
                      <div className="h-px bg-[var(--border)] my-3 opacity-50" />
                      <MobileNavLink href="/reservations" onClick={() => setIsOpen(false)} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>{t('reservations')}</MobileNavLink>
                      <MobileNavLink href="/notifications" onClick={() => setIsOpen(false)} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}>{t('notifications')}</MobileNavLink>
                      <MobileNavLink href="/profile" onClick={() => setIsOpen(false)} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>{t('profile')}</MobileNavLink>
                      {user?.role === 'PASSAGER' && (
                        <MobileNavLink href="/payments" onClick={() => setIsOpen(false)} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}>{t('payments')}</MobileNavLink>
                      )}
                    </>
                  )}

                  {isAuthenticated && user?.role === 'ADMIN' && (
                    <MobileNavLink href="/admin" onClick={() => setIsOpen(false)} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}>{t('admin')}</MobileNavLink>
                  )}
                </nav>
              </div>

              <div className="p-6 border-t border-[var(--border)] bg-[var(--surface-hover)]/30">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm font-bold text-[var(--text)] uppercase tracking-wider">Preferences</p>
                  <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <ThemeToggle />
                  </div>
                </div>

                {isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--text)] truncate">{user?.name}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="md" onClick={handleLogout} className="w-full h-12 rounded-xl text-red-500 hover:bg-red-50 border-red-100 font-bold">
                      {t('logout')}
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/login" onClick={() => setIsOpen(false)} className="col-span-1">
                      <Button variant="secondary" size="md" className="w-full h-12 rounded-xl font-bold">{t('login')}</Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsOpen(false)} className="col-span-1">
                      <Button variant="primary" size="md" className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20">{t('register')}</Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileNavLink({ href, onClick, children, icon }: { href: string; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3.5 text-base font-bold rounded-2xl text-[var(--text)] hover:bg-primary/5 hover:text-primary transition-all active:scale-[0.98]"
    >
      <span className="text-primary/60">{icon}</span>
      {children}
    </Link>
  );
}
