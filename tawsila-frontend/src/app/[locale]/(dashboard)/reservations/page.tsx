'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi, ApiClientError } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { SkeletonText } from '@/components/ui/skeleton';
import { Link } from '@/i18n/navigation';
import { ReviewSubmissionModal } from '@/components/reviews/review-submission-modal';
import { DriverRatingBadge } from '@/components/reviews/driver-rating-badge';
import type { DriverRequestItem, ReservationTrackingItem } from '@/types';
const TERMINAL_RESERVATION = new Set([
  'CANCELED',
  'REFUNDED_FULL',
  'REFUNDED_PARTIAL',
  'PENALIZED',
]);

function isTerminalStatus(status: string) {
  return TERMINAL_RESERVATION.has(status);
}

export default function ReservationsPage() {
  const { user } = useAuthStore();
  const isDriver = user?.role === 'CHAUFFEUR';
  const queryClient = useQueryClient();
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewData, setSelectedReviewData] = useState<{reservationId: string, chauffeurId: string, driverName: string} | null>(null);

  const passQuery = useQuery({
    queryKey: ['reservations', 'passager', user?.userId],
    queryFn: () => reservationsApi.tracking(user!.userId),
    enabled: Boolean(user?.userId && !isDriver),
  });

  const driverQuery = useQuery({
    queryKey: ['reservations', 'chauffeur', user?.userId],
    queryFn: () => reservationsApi.driverRequests(user!.userId),
    enabled: Boolean(user?.userId && isDriver),
  });

  const activeQuery = isDriver ? driverQuery : passQuery;

  const confirmMutation = useMutation({
    mutationFn: (reservationId: string) => reservationsApi.confirm(reservationId, user!.userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations', 'chauffeur', user?.userId] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (reservationId: string) => reservationsApi.cancel(reservationId, user!.userId, isDriver),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });

  const handleConfirm = (id: string) => {
    if (window.confirm('Accepter cette réservation ?')) {
      confirmMutation.mutate(id);
    }
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment annuler cette réservation ?')) {
      cancelMutation.mutate(id);
    }
  };

  const items: (ReservationTrackingItem | DriverRequestItem)[] = isDriver
    ? driverQuery.data || []
    : passQuery.data || [];

  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;
  const errorMessage =
    activeQuery.error instanceof ApiClientError
      ? activeQuery.error.message
      : activeQuery.error instanceof Error
        ? activeQuery.error.message
        : 'Impossible de charger les réservations.';

  return (
    <div className="w-full space-y-8">
      <div className="relative rounded-[2rem] overflow-hidden bg-[#022B3A] text-white shadow-2xl p-8 sm:p-12 lg:p-16">
        <div className="absolute inset-0 bg-[#1F7A8C]/20 mix-blend-overlay pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {isDriver ? 'Demandes de ' : 'Mes '}
            <span className="text-[#BFDBF7]">réservations</span>
          </h1>
          <p className="text-[#E1E5F2] text-lg max-w-2xl">
            {isDriver
              ? 'Gérez les passagers de vos trajets et approuvez les demandes.'
              : 'Suivez le statut de vos places réservées et vos paiements.'}
          </p>
        </div>
      </div>

      {(confirmMutation.isError || cancelMutation.isError) && (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-800"
          role="alert"
        >
          {confirmMutation.error instanceof Error && confirmMutation.error.message}
          {cancelMutation.error instanceof Error && cancelMutation.error.message}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-amber-900 font-medium">{errorMessage}</p>
          <button
            type="button"
            onClick={() => activeQuery.refetch()}
            className="shrink-0 rounded-xl bg-[#022B3A] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#155866]"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="pt-2">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-[var(--surface)] border border-[var(--border)] h-[150px]">
                <SkeletonText lines={3} />
              </div>
            ))}
          </div>
        ) : !isError && items.length > 0 ? (
          <div className="space-y-6">
            {items.map((item) => (
              <article
                key={item.reservationId}
                className="group bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] shadow-sm hover:shadow-xl hover:shadow-[#022B3A]/5 transition-all duration-300 p-6 sm:p-8"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6 pb-6 border-b border-[var(--border)]">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3 text-[#022B3A] mb-2">
                      <span className="font-extrabold text-2xl break-words text-[var(--text)]">{item.depart}</span>
                      <svg
                        className="w-5 h-5 text-[#1F7A8C] shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span className="font-extrabold text-2xl break-words text-[var(--text)]">{item.arrivee}</span>
                    </div>
                    <p className="text-sm font-bold text-[#1F7A8C] uppercase tracking-wide">
                      {formatDate(item.dateDepart)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 lg:justify-end shrink-0">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        item.reservationStatus === 'ACCEPTED'
                          ? 'bg-green-100 text-green-700'
                          : item.reservationStatus === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.reservationStatus}
                    </span>
                    {!isDriver && item.paymentStatus && (
                      <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                        {item.paymentStatus}
                      </span>
                    )}
                    <div className="text-2xl font-black text-[var(--text)] bg-[var(--surface-hover)] px-4 py-2 rounded-xl whitespace-nowrap">
                      {formatCurrency(item.prixParPlace)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col xl:flex-row xl:items-stretch gap-6">
                  <div className="flex items-center gap-4 bg-[var(--surface-hover)] p-4 rounded-2xl border border-[var(--border)] min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-full bg-[#1F7A8C] text-white flex items-center justify-center font-bold text-xl shadow-inner shrink-0">
                      {isDriver
                        ? (item as DriverRequestItem).passagerNom?.charAt(0)
                        : (item as ReservationTrackingItem).chauffeurNom?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#1F7A8C] font-bold uppercase">
                        {isDriver ? 'Passager' : 'Chauffeur'}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-[#022B3A] text-lg leading-tight break-words">
                          {isDriver
                            ? (item as DriverRequestItem).passagerNom
                            : (item as ReservationTrackingItem).chauffeurNom}
                        </p>
                        {!isDriver && (item as ReservationTrackingItem).chauffeurId && (
                          <DriverRatingBadge chauffeurId={(item as ReservationTrackingItem).chauffeurId} />
                        )}
                      </div>
                      <p className="text-sm text-[#1F7A8C]/80 font-medium break-all mt-1">
                        {isDriver
                          ? (item as DriverRequestItem).passagerEmail
                          : (item as ReservationTrackingItem).chauffeurEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:max-w-[560px] xl:justify-end xl:content-start">
                    <Link
                      href={`/trips/${item.tripId}`}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-[#E1E5F2]/50 px-5 py-3 text-sm font-bold text-[#022B3A] hover:bg-[#E1E5F2] transition-colors"
                    >
                      Voir le trajet
                    </Link>

                    {isDriver && item.reservationStatus === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleConfirm(item.reservationId)}
                        disabled={confirmMutation.isPending}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-green-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-500/30 hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {confirmMutation.isPending ? 'En cours…' : 'Accepter'}
                      </button>
                    )}

                    {(isDriver || (!isDriver && (item as ReservationTrackingItem).canContactChauffeur)) && (
                      <Link
                        href={`/chat/${item.tripId}`}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-[#022B3A] px-5 py-3 text-sm font-bold text-white hover:bg-[#155866] transition-colors"
                      >
                        Chat trajet
                      </Link>
                    )}


                    {!isDriver && item.reservationStatus === 'ACCEPTED' && new Date(item.dateDepart) < new Date() && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReviewData({
                            reservationId: item.reservationId,
                            chauffeurId: (item as ReservationTrackingItem).chauffeurId,
                            driverName: (item as ReservationTrackingItem).chauffeurNom,
                          });
                          setReviewModalOpen(true);
                        }}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-colors"
                      >
                        Évaluer
                      </button>
                    )}

                    {!isTerminalStatus(item.reservationStatus) && (
                      <button
                        type="button"
                        onClick={() => handleCancel(item.reservationId)}
                        disabled={cancelMutation.isPending}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-red-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {cancelMutation.isPending ? 'En cours…' : 'Annuler'}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : !isError ? (
          <div className="p-16 sm:p-20 text-center border-2 border-[var(--border)] border-dashed rounded-[2rem] bg-[var(--surface)]">
            <svg
              className="w-20 h-20 text-[#BFDBF7] mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h2 className="text-2xl font-extrabold text-[#022B3A] mb-3">Aucune réservation</h2>
            <p className="text-lg text-[#1F7A8C] font-medium mb-8 max-w-md mx-auto">
              Vous n&apos;avez pas encore de réservations liées à votre compte.
            </p>
            {!isDriver && (
              <Link
                href="/trips"
                className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-[#1F7A8C] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[#1F7A8C]/30 hover:bg-[#155866] transition-colors"
              >
                Rechercher un trajet
              </Link>
            )}
          </div>
        ) : null}
      </div>

      {selectedReviewData && user && (
        <ReviewSubmissionModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setTimeout(() => setSelectedReviewData(null), 300);
          }}
          reservationId={selectedReviewData.reservationId}
          passagerId={user.userId}
          chauffeurId={selectedReviewData.chauffeurId}
          driverName={selectedReviewData.driverName}
        />
      )}
    </div>
  );
}
