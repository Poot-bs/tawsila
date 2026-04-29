'use client';

import { useParams } from 'next/navigation';
import { ChatUI } from '@/components/chat/chat-ui';
import { Link } from '@/i18n/navigation';

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <Link href="/chat" className="inline-flex items-center gap-2 text-[#1F7A8C] font-bold hover:underline">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        Retour aux discussions
      </Link>

      <ChatUI roomId={roomId} />
    </div>
  );
}
