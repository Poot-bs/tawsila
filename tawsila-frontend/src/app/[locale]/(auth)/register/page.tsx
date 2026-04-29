'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authApi } from '@/lib/api';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { UserRole } from '@/types';

export default function RegisterPage() {
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
      // Register returns a User object, then we auto-login
      await authApi.register({ nom, email, password, role });
      const loginRes = await authApi.login({ email, password });
      setSession(
        { userId: loginRes.userId, role: loginRes.role, name: loginRes.name, email: loginRes.email },
        loginRes.token
      );
      router.push('/reservations');
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 sm:p-10 bg-white dark:bg-[#0B1F2A] border border-gray-200 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Inscription</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Créez votre compte Tawsila</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom Complet</label>
          <Input id="reg-name" type="text" value={nom} onChange={(e) => setNom(e.target.value)} required placeholder="John Doe" className="w-full h-12 bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:bg-[var(--surface)] focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] rounded-xl transition-all px-4" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse email</label>
          <Input id="reg-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="votre@email.com" className="w-full h-12 bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:bg-[var(--surface)] focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] rounded-xl transition-all px-4" />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe</label>
          <Input id="reg-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full h-12 bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:bg-[var(--surface)] focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] rounded-xl transition-all px-4" />
        </div>

        <div className="space-y-2.5">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vous êtes ?</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('PASSAGER')}
              id="role-passager"
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-medium text-sm transition-all ${
                role === 'PASSAGER'
                  ? 'border-[#1F7A8C] bg-[#1F7A8C]/5 text-[#1F7A8C]'
                  : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              Passager
            </button>
            <button
              type="button"
              onClick={() => setRole('CHAUFFEUR')}
              id="role-chauffeur"
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-medium text-sm transition-all ${
                role === 'CHAUFFEUR'
                  ? 'border-[#022B3A] dark:border-white bg-[#022B3A]/5 dark:bg-white/10 text-[#022B3A] dark:text-white'
                  : 'border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              Chauffeur
            </button>
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-semibold rounded-xl bg-[#022B3A] hover:bg-[#1F7A8C] text-white transition-all mt-6" id="register-submit">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Inscription...
            </div>
          ) : 'Créer mon compte'}
        </Button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-gray-900 dark:text-white hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}
