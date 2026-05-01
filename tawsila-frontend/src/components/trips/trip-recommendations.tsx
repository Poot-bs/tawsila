'use client';

import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { motion } from 'framer-motion';
import { TripCard } from './trip-card';
import { useTranslations } from 'next-intl';

export function TripRecommendations() {
  const t = useTranslations('trips');
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
    <div className="mb-12 font-body">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">{t('smartMatch')}</p>
          <h2 className="text-3xl font-black text-[var(--text)] tracking-tighter font-display leading-tight">{t('recommendedForYou')}</h2>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Optimization</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recommendations.map((rec, i) => (
          <motion.div
            key={rec.tripId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group"
          >
            <div className="h-full bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/40 transition-all duration-500 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div className="px-4 py-1.5 bg-secondary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-secondary/10">
                  {Math.round(rec.score * 100)}% Match
                </div>
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  {rec.driverRating.toFixed(1)}
                </div>
              </div>
              
              <div className="space-y-6 flex-1 mb-8">
                <div className="flex flex-col gap-4 relative">
                  <div className="absolute left-1.5 top-2.5 bottom-2.5 w-0.5 bg-[var(--border)] group-hover:bg-primary/30 transition-colors rounded-full" />
                  
                  <div className="flex items-start gap-4 relative">
                    <div className="w-3.5 h-3.5 mt-1 rounded-full border-2 border-primary bg-[var(--surface)] shadow-inner z-10" />
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{new Date(rec.dateDepart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-xl font-black text-[var(--text)] tracking-tight line-clamp-1">{rec.depart}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 relative">
                    <div className="w-3.5 h-3.5 mt-1 rounded-full border-2 border-[var(--text-muted)] bg-[var(--surface)] z-10" />
                    <div>
                      <p className="text-xl font-black text-[var(--text)] tracking-tight line-clamp-1">{rec.arrivee}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between mt-auto">
                <div>
                  <span className="text-2xl font-black text-primary tracking-tighter">{rec.prixParPlace.toFixed(3)}</span>
                  <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1.5 opacity-60">TND</span>
                </div>
                <button 
                  onClick={() => window.location.href = `/trips/${rec.tripId}`}
                  className="w-12 h-12 bg-secondary hover:bg-primary text-white rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-secondary/10 hover:scale-110 active:scale-95 group/btn"
                >
                  <svg className="w-6 h-6 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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
