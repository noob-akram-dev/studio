
import { removeUserFromRoom } from '@/lib/chat-store';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const roomCode = formData.get('roomCode') as string;
    const userName = formData.get('userName') as string;

    if (!roomCode || !userName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    await removeUserFromRoom(roomCode, userName);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing user:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
