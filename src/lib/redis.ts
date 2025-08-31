
import Redis from 'ioredis';

// This is a common pattern to cache the Redis connection in a serverless environment.
// It prevents creating a new connection on every function invocation.
declare global {
  var redis: Redis | undefined;
}

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error('REDIS_URL environment variable not set. Please configure your .env file.');
}

// Due to the nature of Redis Pub/Sub, we need a separate client for subscribing
// because a client in subscriber mode cannot be used for other commands.
let subClient: Redis | undefined;

function getRedisClient(forSubscription = false): Redis {
    if (forSubscription) {
        if (!subClient) {
            subClient = new Redis(redisUrl, {
                lazyConnect: true,
                maxRetriesPerRequest: 1,
            });
             subClient.on('error', (err) => {
                console.error('Redis Subscription Client error:', err);
                subClient = undefined;
            });
        }
        return subClient;
    }

    if (global.redis) {
        return global.redis;
    }

    const client = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1, // Don't retry on connection errors, fail fast.
    });

    client.on('error', (err) => {
        console.error('Redis connection error:', err);
        // On error, we want to clear the cached client to force a reconnect on the next request.
        global.redis = undefined;
    });

    global.redis = client;
    return client;
}

export default getRedisClient;
