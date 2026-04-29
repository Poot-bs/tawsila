export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  recipientId?: string | null;
  content: string;
  createdAt: string;
}

export interface ChatMessageRequest {
  senderId: string;
  recipientId?: string | null;
  content: string;
}
