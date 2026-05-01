'use client';

import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatDate } from '@/lib/utils/format';
import { motion } from 'framer-motion';

import { useTranslations } from 'next-intl';

export default function NotificationsPage() {
  const t = useTranslations('notifications');
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
          className="relative overflow-hidden rounded-[2.5rem] bg-secondary text-white px-6 py-12 sm:px-12 shadow-2xl"
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,var(--color-secondary)_25%,var(--color-secondary-light)_75%,var(--color-primary)_120%)] opacity-95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(191,219,247,0.2),transparent_55%)]" />
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-accent/80 mb-3">{t('alertCenter')}</p>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-display leading-tight">
              {t('title')}
            </h1>
            <p className="mt-6 text-lg text-accent/90 font-medium max-w-2xl leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] shadow-sm overflow-hidden"
        >
          {isLoading ? (
            <div className="p-8 space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-6 p-6 border-b border-[var(--border)] animate-pulse">
                  <div className="w-14 h-14 bg-[var(--surface-hover)] rounded-2xl shrink-0" />
                  <div className="space-y-3 flex-1">
                    <div className="h-5 bg-[var(--surface-hover)] rounded-lg w-1/4" />
                    <div className="h-5 bg-[var(--surface-hover)] rounded-lg w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-20 text-center text-red-500 font-black text-xl">
              {t('error')}
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="p-24 text-center space-y-6">
              <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto text-primary border-2 border-dashed border-primary/20">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[var(--text)] tracking-tight">{t('noNotifications')}</h3>
                <p className="text-[var(--text-muted)] font-bold">{t('upToDate')}</p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {notifications.map((notif, i) => (
                <motion.li
                   key={notif.id}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.05 }}
                   className="p-8 flex items-start gap-6 hover:bg-[var(--surface-hover)]/30 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-secondary text-white shadow-lg group-hover:scale-110 group-hover:bg-primary transition-all">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <h4 className="text-lg font-black text-[var(--text)] tracking-tight">{notif.channel === 'EMAIL' ? t('emailReceived') : t('message')}</h4>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                        {notif.createdAt ? formatDate(notif.createdAt) : t('recent')}
                      </span>
                    </div>
                    <p className="mt-3 text-base text-[var(--text-muted)] font-medium leading-relaxed">{notif.message}</p>
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
