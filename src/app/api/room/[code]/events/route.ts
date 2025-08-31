
'use client';

import { getRoomKey, getRoom } from '@/lib/chat-store';
import getRedisClient from '@/lib/redis';
import type { Room } from '@/lib/types';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic'

async function* makeIterator(req: NextRequest, code: string) {
    const roomKey = getRoomKey(code);
    const channel = `room:${code}:events`;
    
    // Set up a new Redis client for subscribing, as a subscribed client cannot be used for other commands.
    const subClient = getRedisClient();
    await subClient.subscribe(channel);
    
    const initialRoomState = await getRoom(code);
    if (initialRoomState) {
        yield `data: ${JSON.stringify(initialRoomState)}\n\n`;
    }

    // Generator function that yields messages from the subscribed Redis client
    const messageIterator = (async function*() {
        while (!req.signal.aborted) {
            const result = await subClient.xread('BLOCK', 0, 'STREAMS', channel, '$');
            if (result) {
                // @ts-ignore
                const [[,[[,[,data]]]]] = result;
                const room = JSON.parse(data) as Room;
                yield `data: ${JSON.stringify(room)}\n\n`;
            }
        }
    })();

    try {
        for await (const message of messageIterator) {
            yield message;
        }
    } finally {
        await subClient.unsubscribe(channel);
        subClient.quit();
        console.log(`Client for ${code} disconnected.`);
    }
}

function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next()
 
      if (done) {
        controller.close()
      } else {
        controller.enqueue(value)
      }
    },
  })
}


export async function GET(
    request: NextRequest,
    { params }: { params: { code: string } }
) {
    const iterator = makeIterator(request, params.code);
    const stream = iteratorToStream(iterator);

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no', // Disable buffering for NGINX
        }
    });
}
