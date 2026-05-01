'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authApi } from '@/lib/api';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await authApi.login({ email, password });
      setSession(
        { userId: res.userId, role: res.role, name: res.name, email: res.email },
        res.token
      );
      router.push('/reservations');
    } catch (err: any) {
      setError(err?.message || t('invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[min(440px,95vw)] mx-auto"
    >
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
        
        <div className="relative p-8 sm:p-12 bg-white/80 dark:bg-[#0B1F2A]/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-2xl">
          <div className="mb-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-[#022B3A] text-white shadow-xl shadow-[#022B3A]/20"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </motion.div>
            <h1 className="text-3xl font-black text-[#022B3A] dark:text-white tracking-tight font-display">{t('loginTitle')}</h1>
            <p className="text-[#1F7A8C] dark:text-[#BFDBF7]/70 font-medium mt-2">{t('loginSubtitle')}</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center font-bold border border-red-100 dark:border-red-900/30"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="login-email" className="block text-xs font-black uppercase tracking-widest text-[#022B3A]/60 dark:text-white/60 ml-1">{t('emailLabel')}</label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('emailPlaceholder')}
                className="w-full h-14 bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-primary/10 focus:border-primary rounded-2xl transition-all px-5 font-medium"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="login-password" className="block text-xs font-black uppercase tracking-widest text-[#022B3A]/60 dark:text-white/60">{t('passwordLabel')}</label>
                <a href="#" className="text-[10px] font-black uppercase tracking-tighter text-[#1F7A8C] hover:text-[#022B3A] dark:hover:text-white transition-colors">{t('forgotPassword')}</a>
              </div>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t('passwordPlaceholder')}
                className="w-full h-14 bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-primary/10 focus:border-primary rounded-2xl transition-all px-5 font-medium"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-14 text-lg font-bold rounded-2xl bg-[#022B3A] hover:bg-[#1F7A8C] text-white transition-all shadow-xl shadow-[#022B3A]/20 active:scale-[0.98] mt-4" 
              id="login-submit"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                  {t('loggingIn')}
                </div>
              ) : t('loginButton')}
            </Button>

            <div className="pt-6 text-center">
              <p className="text-sm text-[#022B3A]/60 dark:text-white/50 font-medium">
                {t('newToPlatform')}{' '}
                <Link href="/register" className="text-[#1F7A8C] dark:text-[#BFDBF7] hover:underline font-bold">
                  {t('createAccount')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
