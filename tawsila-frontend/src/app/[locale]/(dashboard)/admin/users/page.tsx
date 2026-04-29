'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminUsersPage() {
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
      toast.success('Utilisateur suspendu avec succès');
    },
    onError: () => toast.error('Erreur lors de la suspension'),
  });

  const blockMutation = useMutation({
    mutationFn: (userId: string) => adminApi.blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Utilisateur bloqué avec succès');
    },
    onError: () => toast.error('Erreur lors du blocage'),
  });

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Accès refusé. Vous devez être administrateur.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0B1F2A] text-white px-6 py-10 sm:px-10 shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#0B1F2A_30%,#123A47_75%,#1F7A8C_120%)] opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(191,219,247,0.2),transparent_55%)]" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#BFDBF7]">Administration</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight font-display">Gestion des Utilisateurs</h1>
            <p className="mt-4 text-lg text-[#E1E5F2]">Consultez, bloquez ou suspendez les comptes utilisateurs.</p>
          </div>
          <Link href="/admin" className="text-[#BFDBF7] font-bold hover:text-white transition-colors">
            &larr; Retour
          </Link>
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500 font-medium">
            Erreur lors de la récupération des utilisateurs.
          </div>
        ) : !users || users.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            Aucun utilisateur inscrit.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--surface-hover)] border-b border-[var(--border)] text-[var(--text)]">
                  <th className="p-4 font-bold text-sm uppercase tracking-wider">ID / Avatar</th>
                  <th className="p-4 font-bold text-sm uppercase tracking-wider">Nom & Contact</th>
                  <th className="p-4 font-bold text-sm uppercase tracking-wider">Rôle</th>
                  <th className="p-4 font-bold text-sm uppercase tracking-wider">Statut</th>
                  <th className="p-4 font-bold text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users.map(u => (
                  <tr key={u.identifiant} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#022B3A] text-white flex items-center justify-center font-bold shrink-0">
                          {u.nom?.charAt(0) || 'U'}
                        </div>
                        <span className="text-xs font-mono text-gray-400 truncate max-w-[80px]" title={u.identifiant}>
                          {u.identifiant?.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[var(--text)]">{u.nom}</div>
                      <div className="text-sm text-primary">{u.email}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'CHAUFFEUR' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        u.status === 'SUSPENDED' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {u.role !== 'ADMIN' && u.status !== 'BLOCKED' && (
                          <Button 
                            onClick={() => {
                              if(window.confirm('Voulez-vous vraiment bloquer cet utilisateur définitivement ?')) {
                                blockMutation.mutate(u.identifiant);
                              }
                            }}
                            disabled={blockMutation.isPending || suspendMutation.isPending}
                            variant="danger"
                            size="sm"
                            className="text-xs"
                          >
                            Bloquer
                          </Button>
                        )}
                        {u.role !== 'ADMIN' && u.status === 'ACTIVE' && (
                          <Button 
                            onClick={() => {
                              if(window.confirm('Voulez-vous suspendre temporairement cet utilisateur ?')) {
                                suspendMutation.mutate(u.identifiant);
                              }
                            }}
                            disabled={blockMutation.isPending || suspendMutation.isPending}
                            variant="outline"
                            size="sm"
                            className="text-xs border-amber-500 text-amber-600 hover:bg-amber-50"
                          >
                            Suspendre
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
