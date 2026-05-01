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

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

export default function ReservationsPage() {
  const t = useTranslations('reservations');
  const commonT = useTranslations('common');
  const { user } = useAuthStore();
  const isDriver = user?.role === 'CHAUFFEUR';
  const queryClient = useQueryClient();
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewData, setSelectedReviewData] = useState<{reservationId: string, chauffeurId: string, driverName: string} | null>(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'accept' | 'cancel';
    id: string;
  }>({ isOpen: false, type: 'accept', id: '' });

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
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success(t('acceptSuccess'), {
        description: t('acceptSuccessSubtitle'),
      });
      setConfirmModal({ ...confirmModal, isOpen: false });
    },
    onError: (err: any) => {
      toast.error(err?.message || commonT('error'));
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (reservationId: string) => reservationsApi.cancel(reservationId, user!.userId, isDriver),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast.success(t('cancelSuccess'));
      setConfirmModal({ ...confirmModal, isOpen: false });
    },
    onError: (err: any) => {
      toast.error(err?.message || commonT('error'));
    }
  });

  const handleConfirm = (id: string) => {
    setConfirmModal({ isOpen: true, type: 'accept', id });
  };

  const handleCancel = (id: string) => {
    setConfirmModal({ isOpen: true, type: 'cancel', id });
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
        : commonT('error');

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'PENDING': return t('pending');
      case 'ACCEPTED': return t('accepted');
      case 'CANCELED': return t('canceled');
      default: return status;
    }
  };

  return (
    <div className="w-full space-y-8 font-body">
      <div className="relative rounded-[2.5rem] overflow-hidden bg-secondary text-white shadow-2xl p-10 sm:p-14 lg:p-16">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,var(--color-secondary)_25%,var(--color-secondary-light)_75%,var(--color-primary)_120%)] opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(191,219,247,0.2),transparent_55%)]" />
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-accent/80 mb-3">{isDriver ? t('driverHub') || 'DRIVER HUB' : t('travelHistory') || 'TRAVEL HISTORY'}</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-display leading-tight">
            {isDriver ? t('titleDriver') : t('titlePassenger')}
          </h1>
          <p className="mt-6 text-lg text-accent/90 font-medium max-w-2xl leading-relaxed">
            {isDriver ? t('subtitleDriver') : t('subtitlePassenger')}
          </p>
        </div>
      </div>

      {(confirmMutation.isError || cancelMutation.isError) && (
        <div
          className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-6 py-4 text-sm font-black text-red-800 dark:text-red-400 uppercase tracking-widest"
          role="alert"
        >
          {confirmMutation.error instanceof Error && confirmMutation.error.message}
          {cancelMutation.error instanceof Error && cancelMutation.error.message}
        </div>
      )}

      {isError && (
        <div className="rounded-3xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <p className="text-amber-900 dark:text-amber-400 font-black text-lg">{errorMessage}</p>
          <button
            type="button"
            onClick={() => activeQuery.refetch()}
            className="shrink-0 rounded-2xl bg-secondary px-8 py-3.5 text-sm font-black text-white hover:bg-primary transition-all shadow-lg shadow-secondary/20 active:scale-95"
          >
            {commonT('retry')}
          </button>
        </div>
      )}

      <div className="pt-4">
        {isLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-[var(--surface)] border border-[var(--border)] h-[200px] animate-pulse">
                <SkeletonText lines={3} />
              </div>
            ))}
          </div>
        ) : !isError && items.length > 0 ? (
          <div className="space-y-8">
            {items.map((item) => (
              <article
                key={item.reservationId}
                className="group bg-[var(--surface)] rounded-[2.5rem] border border-[var(--border)] shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 p-8 sm:p-10"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-8 pb-8 border-b border-[var(--border)]">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-center gap-4 text-[var(--text)]">
                      <span className="font-black text-3xl tracking-tighter break-words">{item.depart}</span>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </div>
                      <span className="font-black text-3xl tracking-tighter break-words">{item.arrivee}</span>
                    </div>
                    <p className="text-xs font-black text-primary uppercase tracking-[0.2em] opacity-80">
                      {formatDate(item.dateDepart)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 lg:justify-end shrink-0">
                    <span
                      className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                        item.reservationStatus === 'ACCEPTED'
                          ? 'bg-green-500/10 text-green-600 border-green-500/20'
                          : item.reservationStatus === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : 'bg-red-500/10 text-red-600 border-red-500/20'
                      }`}
                    >
                      {getStatusLabel(item.reservationStatus)}
                    </span>
                    {!isDriver && item.paymentStatus && (
                      <span className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {item.paymentStatus}
                      </span>
                    )}
                    <div className="text-2xl font-black text-[var(--text)] bg-[var(--surface-hover)] px-5 py-2.5 rounded-2xl whitespace-nowrap shadow-inner tracking-tighter">
                      {formatCurrency(item.prixParPlace)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col xl:flex-row xl:items-stretch gap-8">
                  <div className="flex items-center gap-6 bg-[var(--surface-hover)]/50 p-6 rounded-[2rem] border border-[var(--border)] min-w-0 flex-1 group-hover:bg-[var(--surface-hover)] transition-colors">
                    <div className="w-16 h-16 rounded-2xl bg-secondary text-white flex items-center justify-center font-black text-2xl shadow-xl shrink-0 group-hover:scale-110 transition-transform">
                      {isDriver
                        ? (item as DriverRequestItem).passagerNom?.charAt(0)
                        : (item as ReservationTrackingItem).chauffeurNom?.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5 opacity-70">
                        {isDriver ? commonT('passenger') : commonT('driver')}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-black text-[var(--text)] text-xl tracking-tight leading-tight break-words">
                          {isDriver
                            ? (item as DriverRequestItem).passagerNom
                            : (item as ReservationTrackingItem).chauffeurNom}
                        </p>
                        {!isDriver && (item as ReservationTrackingItem).chauffeurId && (
                          <DriverRatingBadge chauffeurId={(item as ReservationTrackingItem).chauffeurId} />
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-muted)] font-bold break-all mt-1.5 opacity-80">
                        {isDriver
                          ? (item as DriverRequestItem).passagerEmail
                          : (item as ReservationTrackingItem).chauffeurEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 xl:max-w-[600px] xl:justify-end xl:content-center">
                    <Link
                      href={`/trips/${item.tripId}`}
                      className="inline-flex min-h-[56px] items-center justify-center rounded-2xl bg-[var(--surface-hover)] px-6 py-3 text-sm font-black text-[var(--text)] hover:bg-secondary hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      {t('viewTrip')}
                    </Link>

                    {isDriver && item.reservationStatus === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleConfirm(item.reservationId)}
                        disabled={confirmMutation.isPending}
                        className="inline-flex min-h-[56px] items-center justify-center rounded-2xl bg-green-500 px-8 py-3 text-sm font-black text-white shadow-xl shadow-green-500/20 hover:bg-green-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {confirmMutation.isPending ? t('processing') : t('accept')}
                      </button>
                    )}

                    {(isDriver || (!isDriver && (item as ReservationTrackingItem).canContactChauffeur)) && (
                      <Link
                        href={`/chat/${item.tripId}`}
                        className="inline-flex min-h-[56px] items-center justify-center rounded-2xl bg-secondary px-8 py-3 text-sm font-black text-white hover:bg-primary transition-all shadow-xl shadow-secondary/10 hover:scale-105 active:scale-95"
                      >
                        {t('chat')}
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
                        className="inline-flex min-h-[56px] items-center justify-center rounded-2xl bg-amber-500 px-8 py-3 text-sm font-black text-white shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all hover:scale-105 active:scale-95"
                      >
                        {t('rate')}
                      </button>
                    )}

                    {!isTerminalStatus(item.reservationStatus) && (
                      <button
                        type="button"
                        onClick={() => handleCancel(item.reservationId)}
                        disabled={cancelMutation.isPending}
                        className="inline-flex min-h-[56px] items-center justify-center rounded-2xl bg-red-500 px-8 py-3 text-sm font-black text-white shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        {cancelMutation.isPending ? t('processing') : t('cancel')}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : !isError ? (
          <div className="py-24 px-10 text-center border-2 border-[var(--border)] border-dashed rounded-[3rem] bg-[var(--surface)] space-y-8">
            <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto text-primary border-2 border-dashed border-primary/20">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-[var(--text)] tracking-tight">{t('noReservations')}</h2>
              <p className="text-lg text-[var(--text-muted)] font-medium max-w-md mx-auto">
                {t('noReservationsSubtitle')}
              </p>
            </div>
            {!isDriver && (
              <Link
                href="/trips"
                className="inline-flex min-h-[56px] items-center justify-center rounded-2xl bg-secondary px-10 py-3 text-sm font-black text-white shadow-xl shadow-secondary/20 hover:bg-primary transition-all hover:scale-105 active:scale-95"
              >
                {commonT('search')}
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

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => {
          if (confirmModal.type === 'accept') {
            confirmMutation.mutate(confirmModal.id);
          } else {
            cancelMutation.mutate(confirmModal.id);
          }
        }}
        title={confirmModal.type === 'accept' ? t('acceptConfirm') : t('cancelConfirm')}
        message={confirmModal.type === 'accept' ? t('acceptConfirmSubtitle') : t('cancelConfirmSubtitle')}
        confirmLabel={confirmModal.type === 'accept' ? t('accept') : t('cancel')}
        cancelLabel={commonT('back')}
        type={confirmModal.type === 'accept' ? 'success' : 'danger'}
        isLoading={confirmMutation.isPending || cancelMutation.isPending}
      />
    </div>
  );
}
