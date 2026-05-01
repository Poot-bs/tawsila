'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { useTranslations } from 'next-intl';

export default function AdminUsersPage() {
  const t = useTranslations('admin');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.users(),
    enabled: user?.role === 'ADMIN',
  });

  const suspendMutation = useMutation({
    mutationFn: (userId: string) => adminApi.suspendUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(t('suspendSuccess'));
    },
    onError: () => toast.error(t('suspendError')),
  });

  const blockMutation = useMutation({
    mutationFn: (userId: string) => adminApi.blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(t('blockSuccess'));
    },
    onError: () => toast.error(t('blockError')),
  });

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        {t('accessDenied')}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-body">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-secondary text-white px-6 py-12 sm:px-12 shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,var(--color-secondary)_30%,var(--color-secondary-light)_75%,var(--color-primary)_120%)] opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(191,219,247,0.2),transparent_55%)]" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-accent/80 mb-3">{t('administration')}</p>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-display leading-tight">{t('userManagement')}</h1>
            <p className="mt-4 text-lg text-accent/90 max-w-2xl font-medium">{t('userManagementSubtitle')}</p>
          </div>
          <Link href="/admin" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-3 rounded-2xl text-accent font-black transition-all backdrop-blur-md">
            &larr; {t('back')}
          </Link>
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 space-y-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-20 bg-[var(--surface-hover)] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-20 text-center text-red-500 font-black text-xl">
            {t('errorFetchingUsers')}
          </div>
        ) : !users || users.length === 0 ? (
          <div className="p-32 text-center text-[var(--text-muted)] font-bold text-lg">
            {t('noUsers')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[var(--surface-hover)]/50 border-b border-[var(--border)] text-[var(--text)]">
                  <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em]">{t('avatar')}</th>
                  <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em]">{t('nameContact')}</th>
                  <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em]">{t('role')}</th>
                  <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em]">{t('status')}</th>
                  <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users.map(u => (
                  <tr key={u.identifiant} className="group hover:bg-[var(--surface-hover)]/30 transition-all">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-secondary text-white flex items-center justify-center font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
                          {u.nom?.charAt(0) || 'U'}
                        </div>
                        <span className="text-[10px] font-black font-mono text-[var(--text-muted)] opacity-50 bg-[var(--surface-hover)] px-2 py-1 rounded-md" title={u.identifiant}>
                          {u.identifiant?.substring(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="font-black text-base text-[var(--text)] tracking-tight">{u.nom}</div>
                      <div className="text-xs font-bold text-primary mt-0.5">{u.email}</div>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                        u.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' :
                        u.role === 'CHAUFFEUR' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                        'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        u.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' :
                        u.status === 'SUSPENDED' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                        'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-green-500' : u.status === 'SUSPENDED' ? 'bg-amber-500' : 'bg-red-500'}`} />
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-end gap-3">
                        {u.role !== 'ADMIN' && u.status !== 'BLOCKED' && (
                          <Button 
                            onClick={() => {
                              if(window.confirm(t('blockConfirm'))) {
                                blockMutation.mutate(u.identifiant);
                              }
                            }}
                            disabled={blockMutation.isPending || suspendMutation.isPending}
                            variant="danger"
                            size="sm"
                            className="text-[10px] font-black h-9 rounded-xl shadow-lg shadow-red-500/20"
                          >
                            {t('block')}
                          </Button>
                        )}
                        {u.role !== 'ADMIN' && u.status === 'ACTIVE' && (
                          <Button 
                            onClick={() => {
                              if(window.confirm(t('suspendConfirm'))) {
                                suspendMutation.mutate(u.identifiant);
                              }
                            }}
                            disabled={blockMutation.isPending || suspendMutation.isPending}
                            variant="secondary"
                            size="sm"
                            className="text-[10px] font-black h-9 rounded-xl border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                          >
                            {t('suspend')}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
