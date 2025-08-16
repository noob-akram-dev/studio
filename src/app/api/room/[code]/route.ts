import { getRoom } from '@/lib/chat-store';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  const room = getRoom(params.code);

  if (!room) {
    return new Response('Room not found', { status: 404 });
  }

  return NextResponse.json(room);
}
