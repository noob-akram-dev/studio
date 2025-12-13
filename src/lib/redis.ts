
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error('REDIS_URL environment variable not set. Please configure your .env file.');
}

/**
 * Creates a new Redis client instance.
 * It's crucial that any client created with this function, especially for subscriptions,
 * is properly closed when it's no longer needed to avoid connection leaks.
 */
function getRedisClient(): Redis {
    const client = new Redis(redisUrl, {
        // Options for serverless environments
        lazyConnect: true,
        showFriendlyErrorStack: true,
        enableAutoPipelining: true,
        maxRetriesPerRequest: 0, // Disable retries to fail fast
        retryStrategy: (times) => {
            return null; // No retries
        },
    });

    client.on('error', (err) => {
        // This is a common error when a client is idle for too long.
        // It's safe to ignore in many cases as ioredis handles reconnection.
        if (!err.message.includes('Connection is closed')) {
             console.error('Redis Client Error:', err);
        }
    });

    return client;
}

export default getRedisClient;
