export type NotificationChannel = 'EMAIL' | 'SMS';

export interface Notification {
  id: string;
  userId: string;
  channel: NotificationChannel;
  message: string;
  createdAt?: string;
}
