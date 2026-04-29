'use client';

import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { motion } from 'framer-motion';
import { TripCard } from './trip-card';
import { useTranslations } from 'next-intl';

export function TripRecommendations() {
  const t = useTranslations();
  const { user } = useAuthStore();

  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['recommendations', user?.userId],
    queryFn: () => tripsApi.recommendations({ userId: user!.userId, limit: 3 }),
    enabled: !!user?.userId,
    staleTime: 5 * 60 * 1000,
  });

  if (!user || user.role !== 'PASSAGER') return null;
  if (isLoading) return <RecommendationsSkeleton />;
  if (error || !recommendations || recommendations.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#BFDBF7]/40 rounded-xl text-[#1F7A8C]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
          <h2 className="text-2xl font-extrabold text-[#022B3A] font-display">Recommande pour vous</h2>
        </div>
        <span className="hidden sm:inline-flex text-xs font-bold uppercase tracking-[0.3em] text-[#1F7A8C]">Match intelligent</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.tripId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {/* Convert TripRecommendation to a format TripCard expects, or display directly */}
            <div className="bg-white border border-[#E1E5F2] rounded-3xl p-6 shadow-lg shadow-[#022B3A]/5 hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold px-3 py-1 bg-[#BFDBF7]/50 text-[#022B3A] rounded-full uppercase tracking-wide">
                  Match: {Math.round(rec.score * 100)}%
                </span>
                <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  {rec.driverRating.toFixed(1)}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-3 relative">
                  <div className="absolute left-1.5 top-2.5 bottom-2.5 w-0.5 bg-gradient-to-b from-[#1F7A8C]/60 to-[#1F7A8C]/10 rounded-full" />
                  
                  <div className="flex items-start gap-4 relative">
                    <div className="w-3.5 h-3.5 mt-1 rounded-full border-2 border-primary bg-white shadow-sm shadow-primary/30 z-10" />
                    <div>
                      <p className="text-xs text-[var(--text-muted)] font-medium mb-0.5">{new Date(rec.dateDepart).toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="font-bold text-[#022B3A] line-clamp-1">{rec.depart}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 relative">
                    <div className="w-3.5 h-3.5 mt-1 rounded-full border-2 border-[var(--border)] bg-[var(--text-muted)] z-10" />
                    <div>
                      <p className="font-bold text-[#022B3A] line-clamp-1">{rec.arrivee}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <div>
                  <span className="text-2xl font-black text-[#1F7A8C]">{rec.prixParPlace.toFixed(3)}</span>
                  <span className="text-xs font-bold text-[var(--text-muted)] ml-1 tracking-wider">TND</span>
                </div>
                <button 
                  onClick={() => window.location.href = `/trips/${rec.tripId}`}
                  className="px-4 py-2 bg-[#022B3A] hover:bg-[#1F7A8C] text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-[#022B3A]/20"
                >
                  Voir détails
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RecommendationsSkeleton() {
  return (
    <div className="mb-12 animate-pulse">
      <div className="h-8 w-48 bg-[var(--surface-hover)] rounded-xl mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-[220px] bg-[var(--surface-hover)] rounded-2xl border border-[var(--border)]" />
        ))}
      </div>
    </div>
  );
}
