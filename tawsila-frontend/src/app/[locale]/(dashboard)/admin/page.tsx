'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Link } from '@/i18n/navigation';
import { SystemHealthWidget } from '@/components/admin/system-health-widget';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.dashboard(),
    enabled: user?.role === 'ADMIN',
  });

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Accès refusé. Vous devez être administrateur.
      </div>
    );
  }

  return (
    <div className="relative font-body">
      <div className="pointer-events-none absolute -top-40 right-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(31,122,140,0.15),transparent_65%)] blur-2xl" />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Hero Banner */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#0B1F2A] text-white px-6 py-10 sm:px-10 sm:py-12 shadow-2xl"
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,#0B1F2A_30%,#123A47_75%,#1F7A8C_120%)] opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(191,219,247,0.2),transparent_55%)]" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#BFDBF7]">Administration</p>
              <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight font-display">
                Panneau d'administration
              </h1>
              <p className="mt-4 text-lg text-[#E1E5F2]">
                Supervisez l'activité de la plateforme Tawsila.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/admin/users" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-5 py-2.5 rounded-xl transition-colors backdrop-blur-sm">
                Gérer les utilisateurs
              </Link>
              <Link href="/admin/trips" className="bg-[#1F7A8C] hover:bg-[#155866] text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#1F7A8C]/30">
                Superviser les trajets
              </Link>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 lg:col-span-2 space-y-8">
            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <MetricCard title="Utilisateurs" value={dashboard?.users} isLoading={isLoading} />
              <MetricCard title="Trajets (Total)" value={dashboard?.trips} isLoading={isLoading} />
              <MetricCard title="Chauffeurs" value={dashboard?.chauffeurs} isLoading={isLoading} />
              <MetricCard title="Passagers" value={dashboard?.passagers} isLoading={isLoading} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-4"
            >
              <MetricCard title="Actifs" value={dashboard?.activeUsers} isLoading={isLoading} color="green" />
              <MetricCard title="Suspendus" value={dashboard?.suspendedUsers} isLoading={isLoading} color="yellow" />
              <MetricCard title="Bloqués" value={dashboard?.blockedUsers} isLoading={isLoading} color="red" />
            </motion.div>

            {/* Charts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] shadow-sm"
            >
              <h2 className="text-xl font-bold text-[var(--text)] mb-6">Activité récente (Aperçu)</h2>
              <div className="h-64 flex items-end gap-2">
                {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 group">
                    <div className="w-full bg-accent/50 group-hover:bg-primary rounded-t-lg transition-colors relative" style={{ height: `${height}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {height}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[var(--text-muted)]">J-{6 - i}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-8"
          >
            <SystemHealthWidget />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, isLoading, color = 'blue' }: { title: string, value?: number | string | unknown, isLoading: boolean, color?: 'blue' | 'green' | 'yellow' | 'red' }) {
  const colorStyles = {
    blue: 'bg-[var(--surface)] border-[var(--border)] text-[var(--text)]',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-800 dark:text-green-300',
    yellow: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-800 dark:text-amber-300',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-800 dark:text-red-300',
  };

  return (
    <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${colorStyles[color]}`}>
      <h3 className="text-sm font-bold opacity-75 mb-2">{title}</h3>
      {isLoading ? (
        <div className="h-8 w-16 bg-[var(--surface-hover)] animate-pulse rounded-lg" />
      ) : (
        <p className="text-3xl font-black">{String(value ?? 0)}</p>
      )}
    </div>
  );
}
