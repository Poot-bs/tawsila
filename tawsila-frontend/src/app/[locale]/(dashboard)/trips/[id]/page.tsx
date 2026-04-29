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

export default function TripDetailPage() {
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
      toast.success('Réservation effectuée avec succès !');
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la réservation');
    },
  });

  // Close trip mutation (driver only)
  const closeMutation = useMutation({
    mutationFn: () => tripsApi.close(tripId),
    onSuccess: () => {
      toast.success('Trajet clôturé');
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
    onError: () => toast.error('Erreur lors de la clôture'),
  });

  const handleReserve = () => {
    if (!selectedPaymentMethodId) {
      toast.error('Veuillez sélectionner un moyen de paiement');
      return;
    }
    reserveMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="h-8 w-40 bg-gray-200 animate-pulse rounded-xl" />
        <div className="h-64 bg-gray-100 animate-pulse rounded-3xl" />
        <div className="h-40 bg-gray-100 animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-12">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Trajet introuvable</h2>
          <p className="text-red-500 mb-6">Ce trajet n'existe pas ou n'est plus disponible.</p>
          <Link href="/trips" className="bg-[#1F7A8C] hover:bg-[#022B3A] text-white font-bold px-6 py-3 rounded-xl transition-colors">
            Retour aux trajets
          </Link>
        </div>
      </div>
    );
  }

  const isMyTrip = trip.chauffeur?.identifiant === user?.userId;
  const canReserve = isPassenger && trip.etat === 'OPEN' && trip.placesDisponibles > 0 && !isMyTrip;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Back Link */}
      <Link href="/trips" className="inline-flex items-center gap-2 text-[#1F7A8C] font-bold hover:underline">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        Retour aux trajets
      </Link>

      {/* Main Card */}
      <div className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] shadow-xl shadow-[#022B3A]/5 overflow-hidden">
        {/* Hero Header */}
        <div className="bg-[#022B3A] text-white p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#1F7A8C]/20 mix-blend-overlay pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-3xl sm:text-4xl font-extrabold mb-4">
                <span className="break-words">{trip.depart}</span>
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#BFDBF7] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                <span className="break-words">{trip.arrivee}</span>
              </div>
              <p className="text-[#BFDBF7] font-bold text-lg uppercase tracking-wide">
                {formatDate(trip.dateDepart)}
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0 bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
              <span className="block text-4xl font-black text-white">{formatCurrency(trip.prixParPlace)}</span>
              <span className="text-[#BFDBF7] text-sm font-bold uppercase tracking-wider mt-1 block">par place</span>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-12 space-y-8">
          {/* Trip details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <InfoTile label="Statut" value={trip.etat} accent={trip.etat === 'OPEN'} />
            <InfoTile label="Places max" value={String(trip.placesMax)} />
            <InfoTile label="Disponibles" value={String(trip.placesDisponibles)} accent={trip.placesDisponibles > 0} />
            <InfoTile label="Réservées" value={String(trip.placesReservees)} />
          </div>

          {/* Driver Section */}
          <div className="bg-[var(--surface-hover)] rounded-2xl border border-[var(--border)] p-6 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#1F7A8C] text-white flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
              {trip.chauffeur?.nom?.charAt(0) || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#1F7A8C] font-bold uppercase tracking-wider mb-1">Chauffeur</p>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-bold text-[var(--text)]">{trip.chauffeur?.nom}</h3>
                {trip.chauffeur?.identifiant && (
                  <DriverRatingBadge chauffeurId={trip.chauffeur.identifiant} />
                )}
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-1">{trip.chauffeur?.email}</p>
            </div>
          </div>

          {/* Vehicle Section */}
          {trip.vehicule && (
            <div className="bg-[var(--surface-hover)] rounded-2xl border border-[var(--border)] p-6 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-[#022B3A] text-white flex items-center justify-center shrink-0">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </div>
              <div>
                <p className="text-xs text-[#1F7A8C] font-bold uppercase tracking-wider mb-1">Véhicule</p>
                <h3 className="text-xl font-bold text-[var(--text)]">{trip.vehicule.marque} {trip.vehicule.modele}</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">Imm: {trip.vehicule.immatriculation} · {trip.vehicule.capacite} places</p>
              </div>
            </div>
          )}

          {/* Driver Reviews */}
          {driverReviews && driverReviews.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-[var(--text)] mb-4">Avis récents</h3>
              <div className="space-y-3">
                {driverReviews.slice(0, 3).map(review => (
                  <div key={review.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <svg key={s} className={`w-4 h-4 ${s <= review.stars ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-transparent'}`} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                      ))}
                    </div>
                    {review.comment && <p className="text-[var(--text-muted)] text-sm">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTION SECTION */}
          <div className="border-t border-[var(--border)] pt-8 space-y-4">
            {/* Passenger: Reserve */}
            {canReserve && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[var(--text)]">Réserver ce trajet</h3>
                {paymentMethods && paymentMethods.length > 0 ? (
                  <>
                    <select
                      className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 text-sm font-medium text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-primary"
                      value={selectedPaymentMethodId}
                      onChange={e => setSelectedPaymentMethodId(e.target.value)}
                    >
                      <option value="">Choisir un moyen de paiement</option>
                      {paymentMethods.map(pm => (
                        <option key={pm.id} value={pm.id}>
                          {pm.type} •••• {pm.cardLast4} — {pm.holderName}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={handleReserve}
                      disabled={reserveMutation.isPending || !selectedPaymentMethodId}
                      isLoading={reserveMutation.isPending}
                      className="w-full bg-[#1F7A8C] hover:bg-[#022B3A] text-white font-bold h-14 rounded-2xl text-lg"
                    >
                      Confirmer la réservation — {formatCurrency(trip.prixParPlace)}
                    </Button>
                  </>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                    <p className="text-amber-800 font-medium mb-3">Vous devez d'abord ajouter un moyen de paiement.</p>
                    <Link href="/payments" className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2 rounded-xl transition-colors">
                      Ajouter un moyen de paiement
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Driver: Close trip */}
            {isMyTrip && trip.etat === 'OPEN' && (
              <Button
                onClick={() => {
                  if (window.confirm('Voulez-vous clôturer ce trajet ? Aucune nouvelle réservation ne sera acceptée.')) {
                    closeMutation.mutate();
                  }
                }}
                disabled={closeMutation.isPending}
                isLoading={closeMutation.isPending}
                variant="danger"
                className="w-full h-14 rounded-2xl text-lg"
              >
                Clôturer le trajet
              </Button>
            )}

            {/* Not logged in or not a passenger */}
            {!isPassenger && !isDriver && (
              <div className="text-center py-4">
                <Link href="/login" className="text-[#1F7A8C] font-bold hover:underline">
                  Connectez-vous pour réserver
                </Link>
              </div>
            )}

            {/* Trip is full */}
            {isPassenger && trip.placesDisponibles === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center text-red-700 font-medium">
                Ce trajet est complet. Aucune place disponible.
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
