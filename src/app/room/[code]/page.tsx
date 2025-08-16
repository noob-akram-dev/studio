import { getRoom } from '@/lib/chat-store';
import { notFound } from 'next/navigation';
import { ChatRoom } from '@/components/chat-room';

export const dynamic = 'force-dynamic';

export default async function RoomPage({ params }: { params: { code: string } }) {
  const room = getRoom(params.code);

  if (!room) {
    notFound();
  }

  return <ChatRoom initialRoom={room} />;
}
