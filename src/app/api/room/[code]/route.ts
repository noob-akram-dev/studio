import { getRoom } from '@/lib/firestore-store';
import { NextResponse } from 'next/server';

// Opt out of caching for this route
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const room = await getRoom(code);

  if (!room) {
    // Return a 404 in a standard Next.js way
    return new NextResponse(JSON.stringify({ error: 'Room not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Use NextResponse for consistent JSON responses
  return NextResponse.json(room);
}
