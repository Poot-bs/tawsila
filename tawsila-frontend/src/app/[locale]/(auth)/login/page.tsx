'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authApi } from '@/lib/api';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
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
      // LoginResponse has flat fields: token, userId, role, name, email
      setSession(
        { userId: res.userId, role: res.role, name: res.name, email: res.email },
        res.token
      );
      router.push('/reservations');
    } catch (err: any) {
      setError(err?.message || 'Identifiants invalides');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[min(400px,95vw)] mx-auto p-6 sm:p-10 bg-white dark:bg-[#0B1F2A] border border-gray-200 dark:border-white/10 rounded-[2rem] sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">Bon retour</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Connectez-vous à votre compte Tawsila</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse email</label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="votre@email.com"
            className="w-full h-12 bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:bg-[var(--surface)] focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] rounded-xl transition-all px-4"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mot de passe</label>
            <a href="#" className="text-xs font-medium text-[#1F7A8C] hover:text-[#022B3A] dark:hover:text-white transition-colors">Mot de passe oublié ?</a>
          </div>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full h-12 bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 focus:bg-[var(--surface)] focus:ring-2 focus:ring-[#1F7A8C]/20 focus:border-[#1F7A8C] rounded-xl transition-all px-4"
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-semibold rounded-xl bg-[#022B3A] hover:bg-[#1F7A8C] text-white transition-all mt-6" id="login-submit">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Connexion...
            </div>
          ) : 'Se connecter'}
        </Button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          Nouveau sur Tawsila ?{' '}
          <Link href="/register" className="text-gray-900 dark:text-white hover:underline font-medium">
            Créer un compte
          </Link>
        </p>
      </form>
    </div>
  );
}
