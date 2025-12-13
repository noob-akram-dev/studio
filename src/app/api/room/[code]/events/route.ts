
import { getRoom } from '@/lib/chat-store';
import getRedisClient from '@/lib/redis';
import type { Room } from '@/lib/types';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic'

export async function GET(
    request: NextRequest,
    { params }: { params: { code: string } }
) {
    const channel = `room:events:${params.code}`;
    
    // Create a new Redis client specifically for this subscription.
    // Do not use the shared global client for subscriptions.
    const subClient = getRedisClient().duplicate();

    const stream = new ReadableStream({
        async start(controller) {
            // Function to handle incoming messages from Redis
            const onMessage = (channel: string, message: string) => {
                // The message from Redis is already a JSON string representing the event object
                const data = `data: ${message}\n\n`;
                controller.enqueue(new TextEncoder().encode(data));
            };

            // Set up the Redis subscription
            try {
                await subClient.subscribe(channel);
                subClient.on('message', onMessage);
                console.log(`Subscribed to ${channel}`);

                // Send the initial room state as the first event
                const initialRoom = await getRoom(params.code);
                if (initialRoom) {
                    const initialEvent = { event: 'updated', room: initialRoom };
                    const initialData = `data: ${JSON.stringify(initialEvent)}\n\n`;
                    controller.enqueue(new TextEncoder().encode(initialData));
                }
            } catch (e) {
                console.error(`Failed to subscribe to Redis channel ${channel}`, e);
                controller.close();
                return;
            }

            // Clean up when the client disconnects
            request.signal.addEventListener('abort', () => {
                console.log(`Client for ${params.code} disconnected. Cleaning up.`);
                subClient.removeListener('message', onMessage);
                subClient.unsubscribe(channel).catch(console.error);
                subClient.quit().catch(console.error);
                controller.close();
            });
        },

        cancel(reason) {
            console.log(`Stream canceled for room ${params.code}. Cleaning up.`, reason);
            subClient.unsubscribe(channel).catch(console.error);
            subClient.quit().catch(console.error);
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no', // Disable buffering for NGINX
        }
    });
}
