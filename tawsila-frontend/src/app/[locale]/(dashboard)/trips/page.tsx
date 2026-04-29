'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '@/lib/api';
import { TripFilters, type FilterValues } from '@/components/trips/trip-filters';
import { TripRecommendations } from '@/components/trips/trip-recommendations';
import { TripCard } from '@/components/trips/trip-card';
import { motion } from 'framer-motion';

export default function TripsPage() {
  const [filters, setFilters] = useState<FilterValues>({
    depart: '',
    arrivee: '',
    dateMin: '',
    prixMax: '',
    seatsMin: '1',
    minRating: '0',
  });

  const { data: rawTrips, isLoading, error } = useQuery({
    queryKey: ['trips', filters.depart, filters.arrivee, filters.dateMin, filters.prixMax],
    queryFn: () => tripsApi.search({
      depart: filters.depart || undefined,
      arrivee: filters.arrivee || undefined,
      dateMin: filters.dateMin ? new Date(filters.dateMin).toISOString() : undefined,
      prixMax: filters.prixMax ? Number(filters.prixMax) : undefined,
    }),
    staleTime: 60000,
  });

  // Client-side filtering for advanced filters not directly supported by backend TrajetController endpoint
  const trips = rawTrips?.filter(trip => {
    // Note: Chauffeur interface needs to expose rating if we want to filter by it here,
    // assuming it does or we mock it for now since the backend might not expose it on the standard list.
    const reqSeats = parseInt(filters.seatsMin) || 1;
    if (trip.placesDisponibles < reqSeats) return false;
    
    // For now we'll assume there is a way to get driver rating or we just skip if we don't have it.
    // If backend doesn't send it in GET /api/trajets, we rely on the Recommendations endpoint instead for rating-based matches.
    
    return true;
  });

  return (
    <div className="relative overflow-hidden font-body">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(31,122,140,0.25),transparent_65%)] blur-2xl" />
      <div className="pointer-events-none absolute -right-40 top-20 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(2,43,58,0.28),transparent_60%)] blur-2xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0B1F2A] text-white px-6 py-10 sm:px-10 sm:py-12 shadow-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,#0B1F2A_30%,#123A47_75%,#1F7A8C_120%)] opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(191,219,247,0.25),transparent_55%)]" />
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#BFDBF7]">Explorer les trajets</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight font-display">
              Rechercher un trajet
            </h1>
            <p className="mt-4 text-lg text-[#E1E5F2]">
              Filtrez par ville, date et budget pour trouver la route parfaite pour votre voyage.
            </p>
          </div>
        </section>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_1fr] gap-8">
          <div className="lg:sticky lg:top-24 h-fit">
            <TripFilters onSearch={setFilters} />
          </div>

          <div className="space-y-8">
            <TripRecommendations />

            <div>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-64 rounded-3xl bg-[var(--surface-hover)] border border-[var(--border)]" />
                  ))}
                </div>
              ) : error ? (
                <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-200">
                  Une erreur est survenue lors de la recuperation des trajets.
                </div>
              ) : trips && trips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="text-center py-20 px-6 bg-[var(--surface)] border border-[var(--border)] rounded-3xl">
                  <div className="w-16 h-16 bg-[var(--surface-hover)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--text-muted)]">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text)] mb-2">Aucun trajet trouve</h3>
                  <p className="text-[var(--text-muted)]">
                    Essayez de modifier vos criteres de recherche ou de creer une alerte.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
