'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { wsClient } from '@/lib/api/websocket';
import { apiClient } from '@/lib/api/client';
import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils/cn';
import { STORAGE_KEYS } from '@/lib/utils/constants';

interface ChatUIProps {
  roomId: string;
}

export function ChatUI({ roomId }: ChatUIProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load message history
  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await apiClient.get<ChatMessage[]>(`/chat/rooms/${roomId}/messages`);
        setMessages(history);
        scrollToBottom();
      } catch (e) {
        console.error('Failed to load chat history', e);
      }
    }
    loadHistory();
  }, [roomId]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || '';
    let subscription: { unsubscribe: () => void } | null = null;

    wsClient.connect(
      token,
      () => {
        setConnected(true);
        // Subscribe to the room's topic
        subscription = wsClient.subscribe(`/topic/chat/${roomId}`, (message: ChatMessage) => {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
        });
      },
      (err) => {
        console.error('WebSocket connection error:', err);
        setConnected(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
      wsClient.disconnect();
    };
  }, [roomId, user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user || !connected) return;

    const newMsg = {
      senderId: user.userId,
      recipientId: null,
      content: inputValue.trim(),
    };

    // Send via STOMP
    wsClient.send(`/app/chat.send/${roomId}`, newMsg);
    setInputValue('');
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-[700px] max-h-[80vh] bg-white rounded-[2rem] border border-[#E1E5F2] shadow-xl shadow-[#022B3A]/5 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-[#E1E5F2] px-8 py-5 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-[#022B3A] flex items-center gap-3">
          Salle #{roomId.slice(0, 8)}
        </h2>
        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 ${connected ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
          {connected ? "Connecté" : "Connexion en cours..."}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 rounded-full bg-[#E1E5F2] flex items-center justify-center text-[#1F7A8C] mb-4">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
             </div>
             <p className="text-lg font-bold text-[#022B3A]">Aucun message</p>
             <p className="text-[#1F7A8C] font-medium mt-1">Commencez la discussion maintenant !</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === user.userId;
            const senderLabel = isMe
              ? 'Vous'
              : msg.senderId
                ? `Utilisateur ${msg.senderId.slice(0, 6)}`
                : 'Utilisateur';
            return (
              <div
                key={msg.id || i}
                className={cn(
                  "flex flex-col max-w-[75%]",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F7A8C] mb-1.5 px-2">
                  {senderLabel}
                </span>
                <div
                  className={cn(
                    "px-6 py-4 shadow-sm text-[15px] leading-relaxed",
                    isMe
                      ? "bg-[#1F7A8C] text-white rounded-3xl rounded-tr-md"
                      : "bg-white border border-[#E1E5F2] text-[#022B3A] font-medium rounded-3xl rounded-tl-md"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-[#E1E5F2] bg-white">
        <form onSubmit={sendMessage} className="flex gap-4 w-full">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Écrivez votre message ici..."
            disabled={!connected}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-[#022B3A] font-medium focus:outline-none focus:ring-2 focus:ring-[#1F7A8C] transition-all disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!connected || !inputValue.trim()}
            className="bg-[#022B3A] hover:bg-[#155866] text-white px-8 py-4 rounded-2xl shadow-lg shadow-[#022B3A]/20 transition-all disabled:opacity-50 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
