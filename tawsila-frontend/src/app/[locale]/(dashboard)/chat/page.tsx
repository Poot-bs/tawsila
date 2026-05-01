'use client';

import { useQuery } from '@tanstack/react-query';
import { reservationsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import type { DriverRequestItem, ReservationTrackingItem } from '@/types';

export default function ChatRoomsPage() {
  const { user } = useAuthStore();
  const isDriver = user?.role === 'CHAUFFEUR';

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

  // Filter reservations to only those where chat makes sense (e.g., ACCEPTED, or all active)
  const items = activeQuery.data || [];

  // Unique trips for chat rooms
  const chatRooms = items.filter((item) => {
    if (isDriver) {
      return item.reservationStatus === 'ACCEPTED' || item.reservationStatus === 'PENDING';
    } else {
      const trackingItem = item as ReservationTrackingItem;
      return trackingItem.canContactChauffeur || trackingItem.reservationStatus === 'ACCEPTED';
    }
  });

  // Since a driver might have multiple reservations for the same trip, deduplicate by tripId
  const uniqueChatRooms = Array.from(new Map(chatRooms.map(item => [item.tripId, item])).values());

  return (
    <div className="relative font-body">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(31,122,140,0.18),transparent_70%)] blur-2xl" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Hero Banner */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-secondary text-white px-8 py-12 sm:px-12 sm:py-16 shadow-2xl"
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,var(--color-secondary)_30%,var(--color-secondary-light)_75%,var(--color-primary)_120%)] opacity-95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(191,219,247,0.2),transparent_55%)]" />
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-accent/80 mb-3">Messagerie</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter font-display leading-tight">
              Mes Discussions
            </h1>
            <p className="mt-6 text-lg text-accent/90 font-medium leading-relaxed">
              Retrouvez ici tous les chats liés à vos trajets en cours.
            </p>
          </div>
        </motion.section>

        {activeQuery.isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 animate-pulse" />
            ))}
          </div>
        ) : uniqueChatRooms.length > 0 ? (
          <div className="space-y-4">
            {uniqueChatRooms.map((room, i) => (
              <motion.div
                key={room.tripId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/chat/${room.tripId}`}
                  className="flex items-center gap-6 p-6 bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] hover:shadow-lg hover:shadow-primary/10 transition-all group"
                >
                  <div className="w-14 h-14 bg-[var(--surface-hover)] text-[var(--text)] rounded-full flex items-center justify-center font-bold text-xl shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    {isDriver
                      ? (room as DriverRequestItem).passagerNom?.charAt(0)
                      : (room as ReservationTrackingItem).chauffeurNom?.charAt(0) || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-[var(--text)] truncate">
                      Trajet: {room.depart} ➔ {room.arrivee}
                    </h3>
                    <p className="text-primary text-sm font-medium truncate">
                      Avec {isDriver ? (room as DriverRequestItem).passagerNom : (room as ReservationTrackingItem).chauffeurNom}
                    </p>
                  </div>
                  <div className="shrink-0 text-[var(--text-muted)] group-hover:text-primary transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center py-20 px-6 bg-[var(--surface)] border border-[var(--border)] rounded-[2rem]"
          >
            <div className="w-16 h-16 bg-[var(--surface-hover)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--text)]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-[var(--text)] mb-2">Aucune discussion</h3>
            <p className="text-[var(--text-muted)] font-medium">
              Vous n'avez pas de chats actifs. Les discussions s'ouvrent dès qu'un trajet est réservé.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
