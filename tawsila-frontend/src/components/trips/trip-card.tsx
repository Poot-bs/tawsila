'use client';

import { formatCurrency, formatDate } from '@/lib/utils/format';
import type { Trajet } from '@/types';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface TripCardProps {
  trip: Trajet;
}

export function TripCard({ trip }: TripCardProps) {
  const t = useTranslations('common');
  const driverName = trip.chauffeur?.nom || 'Chauffeur';
  
  return (
    <div className="group bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex flex-col xs:flex-row justify-between items-start gap-4 mb-6">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[#022B3A]">
              <span className="font-bold text-lg sm:text-xl tracking-tight break-words">{trip.depart}</span>
              <svg className="w-4 h-4 text-[#1F7A8C] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              <span className="font-bold text-lg sm:text-xl tracking-tight break-words">{trip.arrivee}</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[var(--text-muted)]">
              {formatDate(trip.dateDepart)}
            </p>
          </div>
          <div className="shrink-0 bg-[var(--surface-hover)] text-[#022B3A] py-1.5 px-3 rounded-xl border border-[var(--border)] self-end xs:self-start">
            <div className="text-base sm:text-lg font-bold tracking-tight">
              {formatCurrency(trip.prixParPlace)}
            </div>
          </div>
        </div>

        {/* Driver Info */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
            {driverName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-[#022B3A] text-base truncate leading-snug">{driverName}</p>
            <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] mt-0.5">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                4.8
              </span>
              <span className="text-[#E1E5F2] hidden sm:inline">•</span>
              <span className="truncate">{trip.vehicule?.marque || 'Peugeot'} {trip.vehicule?.modele || '208'}</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-auto">
          {trip.placesDisponibles > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {trip.placesDisponibles} places disponibles
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Complet
            </span>
          )}
        </div>
      </div>

      {/* Footer Button */}
      <div className="p-4 pt-0 border-t border-[var(--border)] mt-auto">
        <Link href={`/trips/${trip.id}`} className="block w-full mt-4">
          <button className="w-full rounded-xl bg-[#0B1F2A] px-4 py-3 font-bold text-white text-sm transition-all hover:bg-[#1F7A8C] active:scale-[0.98]">
            Réserver
          </button>
        </Link>
      </div>
    </div>
  );
}
