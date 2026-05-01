'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi, reservationsApi, userDataApi, reviewsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { DriverRatingBadge } from '@/components/reviews/driver-rating-badge';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import type { Trajet } from '@/types';

import { useTranslations } from 'next-intl';

export default function TripDetailPage() {
  const t = useTranslations('tripDetails');
  const commonT = useTranslations('common');
  const tripsT = useTranslations('trips');
  const params = useParams();
  const tripId = params.id as string;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isDriver = user?.role === 'CHAUFFEUR';
  const isPassenger = user?.role === 'PASSAGER';

  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');

  // Fetch the full trips list and find ours (since backend has no GET /api/trajets/{id})
  const { data: allTrips, isLoading, isError } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripsApi.search(),
    staleTime: 30000,
  });

  const trip: Trajet | undefined = allTrips?.find(t => t.id === tripId);

  // Fetch passenger payment methods for reservation
  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods', user?.userId],
    queryFn: () => userDataApi.getPaymentMethods(user!.userId),
    enabled: !!user?.userId && isPassenger,
  });

  // Fetch driver reviews
  const { data: driverReviews } = useQuery({
    queryKey: ['driver-reviews', trip?.chauffeur?.identifiant],
    queryFn: () => reviewsApi.getDriverReviews(trip!.chauffeur.identifiant),
    enabled: !!trip?.chauffeur?.identifiant,
  });

  // Reserve mutation
  const reserveMutation = useMutation({
    mutationFn: () => reservationsApi.create({
      passagerId: user!.userId,
      trajetId: tripId,
      moyenPaiementId: selectedPaymentMethodId,
    }),
    onSuccess: () => {
      toast.success(t('reservationSuccess'));
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || t('reservationError'));
    },
  });

  // Close trip mutation (driver only)
  const closeMutation = useMutation({
    mutationFn: () => tripsApi.close(tripId),
    onSuccess: () => {
      toast.success(t('closeSuccess'));
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
    onError: () => toast.error(t('closeError')),
  });

  const handleReserve = () => {
    if (!selectedPaymentMethodId) {
      toast.error(t('choosePayment'));
      return;
    }
    reserveMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="h-8 w-40 bg-[var(--surface-hover)] animate-pulse rounded-xl" />
        <div className="h-64 bg-[var(--surface-hover)] animate-pulse rounded-3xl" />
        <div className="h-40 bg-[var(--surface-hover)] animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-3xl p-12">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-400 mb-2">{t('tripNotFound')}</h2>
          <p className="text-red-500 dark:text-red-300 mb-6">{t('tripNotFoundSubtitle')}</p>
          <Link href="/trips" className="bg-primary hover:bg-primary-dark text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-primary/20">
            {t('backToTrips')}
          </Link>
        </div>
      </div>
    );
  }

  const isMyTrip = trip.chauffeur?.identifiant === user?.userId;
  const canReserve = isPassenger && trip.etat === 'OPEN' && trip.placesDisponibles > 0 && !isMyTrip;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 font-body">
      {/* Back Link */}
      <Link href="/trips" className="inline-flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs hover:gap-4 transition-all group">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </div>
        {t('backToTrips')}
      </Link>

      {/* Main Card */}
      <div className="bg-[var(--surface)] rounded-[3rem] border border-[var(--border)] shadow-2xl shadow-primary/5 overflow-hidden">
        {/* Hero Header */}
        <div className="bg-secondary text-white p-10 sm:p-14 lg:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,var(--color-secondary)_30%,var(--color-secondary-light)_75%,var(--color-primary)_120%)] opacity-95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(191,219,247,0.2),transparent_55%)]" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-none">
                <span className="break-words">{trip.depart}</span>
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 backdrop-blur-sm">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
                <span className="break-words">{trip.arrivee}</span>
              </div>
              <p className="text-accent/90 font-black text-lg uppercase tracking-[0.3em] inline-block px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                {formatDate(trip.dateDepart)}
              </p>
            </div>
            <div className="text-left lg:text-right shrink-0 bg-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl border border-white/20 shadow-2xl min-w-[200px]">
              <span className="block text-5xl font-black text-white tracking-tighter mb-1">{formatCurrency(trip.prixParPlace)}</span>
              <span className="text-accent/80 text-[10px] font-black uppercase tracking-[0.3em] mt-1 block">{tripsT('pricePerSeat')}</span>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-14 space-y-12">
          {/* Trip details grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <InfoTile 
              label={commonT('status')} 
              value={
                trip.etat === 'OPEN' ? commonT('open') : 
                trip.etat === 'CLOSED' ? commonT('closed') : 
                commonT('canceled')
              } 
              accent={trip.etat === 'OPEN'} 
            />
            <InfoTile label={t('maxSeats')} value={String(trip.placesMax)} />
            <InfoTile label={tripsT('available')} value={String(trip.placesDisponibles)} accent={trip.placesDisponibles > 0} />
            <InfoTile label={t('reserved')} value={String(trip.placesReservees)} />
          </div>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Driver Section */}
            <div className="bg-[var(--surface-hover)]/30 rounded-[2rem] border border-[var(--border)] p-8 flex items-center gap-6 transition-all hover:bg-[var(--surface-hover)]/50 hover:scale-[1.02]">
              <div className="w-16 h-16 rounded-[1.25rem] bg-secondary text-white flex items-center justify-center font-black text-2xl shadow-xl shrink-0">
                {trip.chauffeur?.nom?.charAt(0) || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-1.5 opacity-70">{commonT('driver')}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-black text-[var(--text)] tracking-tight leading-none">{trip.chauffeur?.nom}</h3>
                  {trip.chauffeur?.identifiant && (
                    <DriverRatingBadge chauffeurId={trip.chauffeur.identifiant} />
                  )}
                </div>
                <p className="text-sm text-[var(--text-muted)] font-bold mt-1.5 truncate opacity-80">{trip.chauffeur?.email}</p>
              </div>
            </div>

            {/* Vehicle Section */}
            {trip.vehicule && (
              <div className="bg-[var(--surface-hover)]/30 rounded-[2rem] border border-[var(--border)] p-8 flex items-center gap-6 transition-all hover:bg-[var(--surface-hover)]/50 hover:scale-[1.02]">
                <div className="w-16 h-16 rounded-[1.25rem] bg-primary text-white flex items-center justify-center shrink-0 shadow-xl">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-1.5 opacity-70">{tripsT('vehicle')}</p>
                  <h3 className="text-xl font-black text-[var(--text)] tracking-tight truncate leading-none">{trip.vehicule.marque} {trip.vehicule.modele}</h3>
                  <p className="text-sm text-[var(--text-muted)] font-bold mt-1.5 truncate opacity-80">Imm: {trip.vehicule.immatriculation} · {trip.vehicule.capacite} {tripsT('seats')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Driver Reviews */}
          {driverReviews && driverReviews.length > 0 && (
            <div className="animate-fade-up space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-[var(--text)] tracking-tighter">{t('recentReviews')}</h3>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">{driverReviews.length} avis</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {driverReviews.slice(0, 2).map(review => (
                  <div key={review.id} className="bg-[var(--surface-hover)]/20 border border-[var(--border)] rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-4">
                      {[1, 2, 3, 4, 5].map(s => (
                        <svg key={s} className={`w-4 h-4 ${s <= review.stars ? 'text-amber-500 fill-amber-500' : 'text-[var(--border)] fill-transparent'}`} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                      ))}
                    </div>
                    {review.comment && <p className="text-[var(--text-muted)] text-base font-medium italic leading-relaxed opacity-90">"{review.comment}"</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTION SECTION */}
          <div className="border-t border-[var(--border)] pt-12 space-y-8">
            {/* Passenger: Reserve */}
            {canReserve && (
              <div className="max-w-2xl mx-auto space-y-8 text-center bg-primary/5 p-10 rounded-[2.5rem] border border-primary/10">
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-[var(--text)] tracking-tighter">{t('reserveTrip')}</h3>
                  <p className="text-[var(--text-muted)] font-medium">Sélectionnez un moyen de paiement pour confirmer votre trajet</p>
                </div>

                {paymentMethods && paymentMethods.length > 0 ? (
                  <div className="space-y-6">
                    <div className="relative group">
                      <select
                        className="w-full h-16 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl px-6 text-base font-black text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer transition-all hover:border-primary/40 shadow-inner"
                        value={selectedPaymentMethodId}
                        onChange={e => setSelectedPaymentMethodId(e.target.value)}
                      >
                        <option value="">{t('choosePayment')}</option>
                        {paymentMethods.map(pm => (
                          <option key={pm.id} value={pm.id}>
                            {pm.type} •••• {pm.cardLast4} — {pm.holderName}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                    <Button
                      onClick={handleReserve}
                      disabled={reserveMutation.isPending || !selectedPaymentMethodId}
                      isLoading={reserveMutation.isPending}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-black h-18 rounded-[1.5rem] text-xl shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 py-4"
                    >
                      {t('confirmReservation')} — {formatCurrency(trip.prixParPlace)}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-[2rem] p-10 text-center space-y-6">
                    <p className="text-amber-600 dark:text-amber-400 font-black text-xl leading-tight">{t('addPaymentMethodFirst')}</p>
                    <Link href="/profile" className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-black px-10 py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/20 active:scale-95 uppercase tracking-widest text-sm">
                      {t('addPaymentMethod')}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Driver: Close trip */}
            {isMyTrip && trip.etat === 'OPEN' && (
              <Button
                onClick={() => {
                  if (window.confirm(t('closeTripConfirm'))) {
                    closeMutation.mutate();
                  }
                }}
                disabled={closeMutation.isPending}
                isLoading={closeMutation.isPending}
                variant="danger"
                className="w-full h-18 rounded-[1.5rem] text-xl font-black shadow-2xl shadow-red-500/20 uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 py-4"
              >
                {t('closeTrip')}
              </Button>
            )}

            {/* Not logged in or not a passenger */}
            {!isPassenger && !isDriver && (
              <div className="text-center py-10">
                <Link href="/login" className="inline-block bg-secondary text-white font-black px-12 py-4 rounded-[1.5rem] hover:bg-primary transition-all tracking-[0.2em] shadow-xl shadow-secondary/10 uppercase text-sm">
                  {t('loginToReserve')}
                </Link>
              </div>
            )}

            {/* Trip is full */}
            {isPassenger && trip.placesDisponibles === 0 && (
              <div className="bg-red-500/5 border border-red-500/10 rounded-[2rem] p-10 text-center text-red-600 dark:text-red-400 font-black text-2xl tracking-tighter">
                {t('tripFull')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl p-4 text-center">
      <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-black ${accent ? 'text-green-600 dark:text-green-400' : 'text-[var(--text)]'}`}>{value}</p>
    </div>
  );
}
