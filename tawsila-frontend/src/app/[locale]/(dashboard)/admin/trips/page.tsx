'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { Link } from '@/i18n/navigation';

import { useTranslations } from 'next-intl';

export default function AdminTripsPage() {
  const t = useTranslations('admin');
  const { user } = useAuthStore();

  const { data: trips, isLoading, isError } = useQuery({
    queryKey: ['admin-trips'],
    queryFn: () => adminApi.trips(),
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-body">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-secondary text-white px-6 py-12 sm:px-12 shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,var(--color-secondary)_30%,var(--color-secondary-light)_75%,var(--color-primary)_120%)] opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(191,219,247,0.2),transparent_55%)]" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-accent/80 mb-3">{t('administration')}</p>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-display leading-tight">{t('superviseTripsTitle')}</h1>
            <p className="mt-4 text-lg text-accent/90 max-w-2xl font-medium">{t('superviseTripsSubtitle')}</p>
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
            {t('errorFetchingTrips')}
          </div>
        ) : !trips || trips.length === 0 ? (
          <div className="p-32 text-center text-[var(--text-muted)] font-bold text-lg">
            {t('noTrips')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-[var(--surface-hover)]/50 border-b border-[var(--border)] text-[var(--text)]">
                  <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em]">{t('tripId')}</th>
                  <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em]">{t('departArrivee')}</th>
                  <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em]">{t('date')}</th>
                  <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em]">{t('driver')}</th>
                  <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em]">{t('seats')}</th>
                  <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em]">{t('price')}</th>
                  <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em]">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {trips.map(trip => (
                  <tr key={trip.id} className="group hover:bg-[var(--surface-hover)]/30 transition-all">
                    <td className="p-6">
                      <span className="text-[10px] font-black font-mono text-[var(--text-muted)] opacity-50 bg-[var(--surface-hover)] px-2 py-1 rounded-md">
                        {trip.id?.substring(0, 8)}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="font-black text-base text-[var(--text)] tracking-tight">{trip.depart}</div>
                      <div className="text-xs font-black text-primary mt-1 flex items-center gap-2">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        {trip.arrivee}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-sm font-bold text-[var(--text)]">{formatDate(trip.dateDepart)}</div>
                    </td>
                    <td className="p-6">
                      <div className="font-black text-[var(--text)] tracking-tight">{trip.chauffeur.nom}</div>
                      <div className="text-[10px] font-bold text-[var(--text-muted)]">{trip.chauffeur.email}</div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg font-black text-primary">{trip.placesDisponibles}</span>
                        <span className="text-xs font-bold text-[var(--text-muted)]">/ {trip.placesMax}</span>
                      </div>
                    </td>
                    <td className="p-6 font-black text-lg text-[var(--text)]">
                      {formatCurrency(trip.prixParPlace)}
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        trip.etat === 'OPEN' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' :
                        trip.etat === 'CLOSED' ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20' :
                        trip.etat === 'CANCELED' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' :
                        'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${trip.etat === 'OPEN' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                        {trip.etat}
                      </span>
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
