'use client';

import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatDate } from '@/lib/utils/format';
import { motion } from 'framer-motion';

export default function NotificationsPage() {
  const { user } = useAuthStore();

  const { data: notifications, isLoading, isError } = useQuery({
    queryKey: ['notifications', user?.userId],
    queryFn: () => notificationsApi.getAll(user!.userId),
    enabled: !!user?.userId,
  });

  return (
    <div className="relative font-body">
      <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(31,122,140,0.18),transparent_70%)] blur-2xl" />

      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#0B1F2A] text-white px-6 py-10 sm:px-10"
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,#0B1F2A_25%,#123A47_75%,#1F7A8C_120%)] opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(191,219,247,0.2),transparent_55%)]" />
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#BFDBF7]">Centre d'alertes</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight font-display">
              Notifications
            </h1>
            <p className="mt-4 text-lg text-[#E1E5F2]">
              Gardez un oeil sur les confirmations de trajet et les messages importants.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden"
        >
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 border-b border-[var(--border)] animate-pulse">
                  <div className="w-12 h-12 bg-[var(--surface-hover)] rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-[var(--surface-hover)] rounded w-1/4" />
                    <div className="h-4 bg-[var(--surface-hover)] rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-16 text-center text-red-500 font-medium bg-red-50 dark:bg-red-900/20">
              Erreur lors de la recuperation de vos notifications.
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-[var(--surface-hover)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--text)]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--text)] mb-2">Aucune notification</h3>
              <p className="text-[var(--text-muted)]">Vous etes a jour.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {notifications.map((notif, i) => (
                <motion.li
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-6 flex items-start gap-4 hover:bg-[var(--surface-hover)] transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-[var(--surface-hover)] text-[var(--text)] group-hover:bg-primary group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-lg font-bold text-[var(--text)]">{notif.channel === 'EMAIL' ? 'Email recu' : 'Message'}</h4>
                      <span className="text-xs font-bold text-primary whitespace-nowrap bg-primary/10 px-2 py-1 rounded-full">
                        {notif.createdAt ? formatDate(notif.createdAt) : 'Recent'}
                      </span>
                    </div>
                    <p className="mt-1 text-[var(--text-muted)]">{notif.message}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  );
}
