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

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'PASSAGER' | 'CHAUFFEUR'>('PASSAGER');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authApi.register({ nom, email, password, role });
      const loginRes = await authApi.login({ email, password });
      setSession(
        { userId: loginRes.userId, role: loginRes.role, name: loginRes.name, email: loginRes.email },
        loginRes.token
      );
      router.push('/reservations');
    } catch (err: any) {
      setError(err?.message || t('registerError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[min(480px,95vw)] mx-auto py-8"
    >
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
        
        <div className="relative p-8 sm:p-12 bg-white/80 dark:bg-[#0B1F2A]/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-2xl">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-[#022B3A] dark:text-white tracking-tight font-display">{t('registerTitle')}</h1>
            <p className="text-[#1F7A8C] dark:text-[#BFDBF7]/70 font-medium mt-2">{t('registerSubtitle')}</p>
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
              <label htmlFor="reg-name" className="block text-xs font-black uppercase tracking-widest text-[#022B3A]/60 dark:text-white/60 ml-1">{t('nameLabel')}</label>
              <Input id="reg-name" type="text" value={nom} onChange={(e) => setNom(e.target.value)} required placeholder={t('namePlaceholder')} className="w-full h-14 bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-primary/10 focus:border-primary rounded-2xl transition-all px-5 font-medium" />
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-email" className="block text-xs font-black uppercase tracking-widest text-[#022B3A]/60 dark:text-white/60 ml-1">{t('emailLabel')}</label>
              <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t('emailPlaceholder')} className="w-full h-14 bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-primary/10 focus:border-primary rounded-2xl transition-all px-5 font-medium" />
            </div>

            <div className="space-y-2">
              <label htmlFor="reg-password" className="block text-xs font-black uppercase tracking-widest text-[#022B3A]/60 dark:text-white/60 ml-1">{t('passwordLabel')}</label>
              <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder={t('passwordPlaceholder')} className="w-full h-14 bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:bg-white dark:focus:bg-white/10 focus:ring-4 focus:ring-primary/10 focus:border-primary rounded-2xl transition-all px-5 font-medium" />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-[#022B3A]/60 dark:text-white/60 ml-1">{t('roleLabel')}</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('PASSAGER')}
                  id="role-passager"
                  className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                    role === 'PASSAGER'
                      ? 'border-[#1F7A8C] bg-[#1F7A8C]/5 text-[#1F7A8C] shadow-lg shadow-[#1F7A8C]/10'
                      : 'border-gray-100 dark:border-white/5 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  {t('rolePassager')}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('CHAUFFEUR')}
                  id="role-chauffeur"
                  className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                    role === 'CHAUFFEUR'
                      ? 'border-[#022B3A] dark:border-white bg-[#022B3A]/5 dark:bg-white/10 text-[#022B3A] dark:text-white shadow-lg shadow-[#022B3A]/10'
                      : 'border-gray-100 dark:border-white/5 text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polyline points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  {t('roleChauffeur')}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-14 text-lg font-bold rounded-2xl bg-[#022B3A] hover:bg-[#1F7A8C] text-white transition-all shadow-xl shadow-[#022B3A]/20 active:scale-[0.98] mt-4" 
              id="register-submit"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                  {t('registering')}
                </div>
              ) : t('registerButton')}
            </Button>

            <div className="pt-6 text-center">
              <p className="text-sm text-[#022B3A]/60 dark:text-white/50 font-medium">
                {t('alreadyHaveAccount')}{' '}
                <Link href="/login" className="text-[#1F7A8C] dark:text-[#BFDBF7] hover:underline font-bold">
                  {t('loginButton')}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
