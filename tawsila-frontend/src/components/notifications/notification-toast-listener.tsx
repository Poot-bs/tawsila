'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth-store';
import { wsClient } from '@/lib/api/websocket';
import { STORAGE_KEYS } from '@/lib/utils/constants';
import type { Notification } from '@/types';

export function NotificationToastListener() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || '';
    let subscription: { unsubscribe: () => void } | null = null;

    wsClient.connect(
      token,
      () => {
        subscription = wsClient.subscribe(`/topic/notifications/${user.userId}`, (payload: Notification) => {
          if (!payload?.message) return;
          toast(payload.message, {
            description: payload.channel ? `Canal: ${payload.channel}` : undefined,
          });
        });
      },
      (err) => {
        console.error('Notification WebSocket error:', err);
      }
    );

    return () => {
      subscription?.unsubscribe();
      wsClient.disconnect();
    };
  }, [user]);

  return null;
}
