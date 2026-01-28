import { getRoom } from '@/lib/firestore-store';
import { notFound } from 'next/navigation';
import { ChatRoom } from '@/components/chat-room';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RoomPage({ params, searchParams }: { params: Promise<{ code: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { code } = await params;
  const room = await getRoom(code);

  if (!room) {
    notFound();
  }

  return <ChatRoom initialRoom={room} />;
}
