import Redis from 'ioredis';

// This will load the REDIS_URL from the .env file.
// Make sure your .env file is configured correctly.
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error('REDIS_URL environment variable not set. Please configure your .env file.');
}

// Create a new Redis client instance.
// The "lazyConnect" option prevents the client from connecting until a command is actually used.
const redis = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1, // Don't retry on connection errors, fail fast.
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

export default redis;
