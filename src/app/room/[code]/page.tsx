import { getRoom } from '@/lib/chat-store';
import { notFound } from 'next/navigation';
import { ChatRoom } from '@/components/chat-room';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RoomPage({ params, searchParams }: { params: { code: string }, searchParams: { [key: string]: string | string[] | undefined }}) {
  const room = await getRoom(params.code);

  if (!room) {
    notFound();
  }

  return <ChatRoom initialRoom={room} />;
}
