
import { getRoom } from '@/lib/chat-store';
import getRedisClient from '@/lib/redis';
import type { Room } from '@/lib/types';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic'

async function* makeIterator(req: NextRequest, code: string) {
    const channel = `room:events:${code}`;
    
    // Set up a new Redis client for subscribing, as a subscribed client cannot be used for other commands.
    const subClient = getRedisClient(true);
    await subClient.subscribe(channel);
    
    // Send initial state upon connection
    const initialRoom = await getRoom(code);
    if (initialRoom) {
        const initialEvent = { event: 'updated', room: initialRoom };
        yield `data: ${JSON.stringify(initialEvent)}\n\n`;
    }

    // Generator function that yields messages from the subscribed Redis client
    const messageIterator = (async function*() {
        while (!req.signal.aborted) {
            try {
                const message = await new Promise<string | null>((resolve) => {
                    subClient.once('message', (channel, message) => {
                        resolve(message);
                    });

                    // If the request is aborted, we resolve with null to break the loop
                    req.signal.addEventListener('abort', () => resolve(null));
                });

                if (message === null) {
                    break; // Client disconnected
                }

                // The message from Redis is already a JSON string representing the event object
                yield `data: ${message}\n\n`;

            } catch (error) {
                // This can happen if the connection is closed, which is expected on disconnect.
                if (!req.signal.aborted) {
                    console.error(`Error reading from Redis pub/sub for room ${code}:`, error);
                }
                break;
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
     async cancel() {
      await iterator.return();
    }
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
