'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '@/lib/api';
import { TripFilters, type FilterValues } from '@/components/trips/trip-filters';
import { TripRecommendations } from '@/components/trips/trip-recommendations';
import { TripCard } from '@/components/trips/trip-card';
import { motion } from 'framer-motion';

import { useTranslations } from 'next-intl';

export default function TripsPage() {
  const t = useTranslations('trips');
  const [filters, setFilters] = useState<FilterValues>({
    depart: '',
    arrivee: '',
    dateMin: '',
    prixMax: '',
    seatsMin: '1',
    minRating: '0',
  });

  const { data: rawTrips, isLoading, error } = useQuery({
    queryKey: ['trips', filters],
    queryFn: () => {
      console.log('Fetching trips with filters:', filters);
      return tripsApi.search({
        depart: filters.depart || undefined,
        arrivee: filters.arrivee || undefined,
        dateMin: filters.dateMin ? `${filters.dateMin}T00:00:00` : undefined,
        prixMax: filters.prixMax ? Number(filters.prixMax) : undefined,
      });
    },
    staleTime: 60000,
  });

  // Client-side filtering for advanced filters not directly supported by backend TrajetController endpoint
  const trips = rawTrips?.filter(trip => {
    const reqSeats = parseInt(filters.seatsMin) || 1;
    if (trip.placesDisponibles < reqSeats) return false;
    
    const minRating = parseFloat(filters.minRating) || 0;
    return true;
  });

  return (
    <div className="relative overflow-hidden font-body">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(31,122,140,0.25),transparent_65%)] blur-2xl" />
      <div className="pointer-events-none absolute -right-40 top-20 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(2,43,58,0.28),transparent_60%)] blur-2xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-secondary text-white px-6 py-12 sm:px-12 shadow-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,var(--color-secondary)_30%,var(--color-secondary-light)_75%,var(--color-primary)_120%)] opacity-95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(191,219,247,0.25),transparent_55%)]" />
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-accent/80 mb-3">{t('explorerTrajets') || 'EXPLORER LES TRAJETS'}</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-display leading-tight">
              {t('searchTitle')}
            </h1>
            <p className="mt-6 text-lg text-accent/90 font-medium max-w-xl leading-relaxed">
              {t('searchSubtitle')}
            </p>
          </div>
        </section>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_1fr] gap-8 sm:gap-12">
          <div className="lg:sticky lg:top-24 h-fit">
            <TripFilters onSearch={setFilters} />
          </div>

          <div className="space-y-10 sm:space-y-12">
            <TripRecommendations />

            <div className="space-y-6 sm:space-y-8">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 animate-pulse">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-72 rounded-[2rem] bg-[var(--surface-hover)] border border-[var(--border)]" />
                  ))}
                </div>
              ) : error ? (
                <div className="p-8 bg-red-500/5 text-red-600 rounded-[2rem] border border-red-500/10 font-bold text-center">
                  {t('error')}
                </div>
              ) : trips && trips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {trips.map((trip, i) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <TripCard trip={trip} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 px-8 bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] shadow-sm space-y-6">
                  <div className="w-20 h-20 bg-[var(--surface-hover)] rounded-[2rem] flex items-center justify-center mx-auto text-primary/40 border-2 border-dashed border-[var(--border)]">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-[var(--text)] tracking-tight">{t('noResults')}</h3>
                    <p className="text-[var(--text-muted)] font-medium max-w-sm mx-auto">
                      {t('tryAdjusting')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
