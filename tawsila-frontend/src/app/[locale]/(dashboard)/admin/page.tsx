'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Link } from '@/i18n/navigation';
import { SystemHealthWidget } from '@/components/admin/system-health-widget';
import { motion } from 'framer-motion';

import { useTranslations } from 'next-intl';

export default function AdminDashboardPage() {
  const t = useTranslations('admin');
  const { user } = useAuthStore();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.dashboard(),
    enabled: user?.role === 'ADMIN',
  });

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        {t('accessDenied')}
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
          className="relative overflow-hidden rounded-[2.5rem] bg-secondary text-white px-6 py-12 sm:px-12 sm:py-16 shadow-2xl"
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,var(--color-secondary)_30%,var(--color-secondary-light)_75%,var(--color-primary)_120%)] opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(191,219,247,0.2),transparent_55%)]" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.4em] text-accent/80 mb-3">{t('administration')}</p>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-display leading-[1.1]">
                {t('dashboardTitle')}
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-accent/90 font-medium leading-relaxed">
                {t('dashboardSubtitle')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <Link href="/admin/users" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black px-8 py-4 rounded-2xl transition-all backdrop-blur-md text-center">
                {t('manageUsers')}
              </Link>
              <Link href="/admin/trips" className="bg-primary hover:bg-primary-dark text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-primary/30 text-center">
                {t('superviseTrips')}
              </Link>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-1 lg:col-span-2 space-y-8">
            {/* Key Metrics */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
              >
                <MetricCard title={t('users')} value={dashboard?.users} isLoading={isLoading} />
                <MetricCard title={t('tripsTotal')} value={dashboard?.trips} isLoading={isLoading} />
                <MetricCard title={t('drivers')} value={dashboard?.chauffeurs} isLoading={isLoading} />
                <MetricCard title={t('passengers')} value={dashboard?.passagers} isLoading={isLoading} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <MetricCard title={t('active')} value={dashboard?.activeUsers} isLoading={isLoading} color="green" />
                <MetricCard title={t('suspended')} value={dashboard?.suspendedUsers} isLoading={isLoading} color="yellow" />
                <MetricCard title={t('blocked')} value={dashboard?.blockedUsers} isLoading={isLoading} color="red" />
              </motion.div>
            </div>

            {/* Charts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[var(--surface)] p-8 sm:p-10 rounded-[2.5rem] border border-[var(--border)] shadow-sm"
            >
              <h2 className="text-2xl font-black text-[var(--text)] mb-10 font-display tracking-tight">{t('recentActivity')}</h2>
              <div className="h-72 flex items-end gap-3 sm:gap-4">
                {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end items-center gap-4 group">
                    <div className="w-full bg-primary/10 group-hover:bg-primary rounded-2xl transition-all duration-500 relative cursor-pointer" style={{ height: `${height}%` }}>
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-secondary text-white text-[10px] font-black py-2 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-xl">
                        {height}
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{t('day')}-{6 - i}</span>
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
    green: 'bg-green-500/5 dark:bg-green-500/10 border-green-500/10 dark:border-green-500/20 text-green-700 dark:text-green-400',
    yellow: 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/10 dark:border-amber-500/20 text-amber-700 dark:text-amber-400',
    red: 'bg-red-500/5 dark:bg-red-500/10 border-red-500/10 dark:border-red-500/20 text-red-700 dark:text-red-400',
  };

  return (
    <div className={`p-8 rounded-[2rem] border shadow-sm flex flex-col justify-between transition-all hover:scale-[1.02] ${colorStyles[color]}`}>
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-4">{title}</h3>
      {isLoading ? (
        <div className="h-10 w-20 bg-[var(--surface-hover)] animate-pulse rounded-xl" />
      ) : (
        <p className="text-4xl font-black tracking-tighter">{String(value ?? 0)}</p>
      )}
    </div>
  );
}
