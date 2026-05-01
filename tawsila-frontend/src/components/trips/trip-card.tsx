'use client';

import { formatCurrency, formatDate } from '@/lib/utils/format';
import type { Trajet } from '@/types';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface TripCardProps {
  trip: Trajet;
}

export function TripCard({ trip }: TripCardProps) {
  const commonT = useTranslations('common');
  const tripsT = useTranslations('trips');
  const driverName = trip.chauffeur?.nom || 'Chauffeur';
  
  return (
    <div className="group bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/40 transition-all duration-500 overflow-hidden flex flex-col h-full font-body">
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-3 text-[var(--text)]">
              <span className="font-black text-2xl tracking-tighter break-words">{trip.depart}</span>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
              <span className="font-black text-2xl tracking-tighter break-words">{trip.arrivee}</span>
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-70">
              {formatDate(trip.dateDepart)}
            </p>
          </div>
          <div className="shrink-0 bg-secondary text-white py-2 px-4 rounded-2xl shadow-xl shadow-secondary/20">
            <div className="text-xl font-black tracking-tighter">
              {formatCurrency(trip.prixParPlace)}
            </div>
          </div>
        </div>

        {/* Driver Info */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-[var(--surface-hover)]/50 rounded-2xl border border-[var(--border)] transition-colors group-hover:bg-[var(--surface-hover)]">
          <div className="w-12 h-12 rounded-2xl bg-secondary text-white flex items-center justify-center font-black text-xl shrink-0 shadow-lg group-hover:scale-110 transition-transform">
            {driverName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-[var(--text)] text-base tracking-tight truncate leading-none mb-1.5">{driverName}</p>
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
              <span className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                4.8
              </span>
              <span className="opacity-30">•</span>
              <span className="truncate opacity-80 uppercase tracking-wider text-[10px]">{trip.vehicule?.marque || 'Peugeot'} {trip.vehicule?.modele || '208'}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-auto flex items-center gap-2">
          {trip.placesDisponibles > 0 ? (
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {trip.placesDisponibles} {tripsT('available')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {tripsT('full')}
            </span>
          )}
        </div>
      </div>

      {/* Footer Button */}
      <div className="p-6 pt-0 border-t border-[var(--border)] mt-auto bg-[var(--surface-hover)]/30 group-hover:bg-[var(--surface-hover)]/50 transition-colors">
        <Link href={`/trips/${trip.id}`} className="block w-full mt-6">
          <button className="w-full rounded-2xl bg-secondary hover:bg-primary text-white py-4 px-6 font-black text-sm tracking-widest uppercase transition-all active:scale-[0.98] shadow-xl shadow-secondary/10 hover:shadow-primary/30 flex items-center justify-center gap-2 group/btn">
            {commonT('book')}
            <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </Link>
      </div>
    </div>
  );
}
