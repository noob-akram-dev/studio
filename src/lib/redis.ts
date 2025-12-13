
import Redis from 'ioredis';

// This is a common pattern to cache the Redis connection in a serverless environment.
// It prevents creating a new connection on every function invocation.
declare global {
  var redisClient: Redis | undefined;
  var redisSubClient: Redis | undefined;
}

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error('REDIS_URL environment variable not set. Please configure your .env file.');
}

function createNewClient(): Redis {
    const client = new Redis(redisUrl, {
        lazyConnect: true,
        maxRetriesPerRequest: 1, // Don't retry on connection errors, fail fast.
    });
    
    // On error, we want to clear the cached client to force a reconnect on the next request.
    client.on('error', (err) => {
        console.error('Redis connection error:', err);
        if (global.redisClient === client) {
            global.redisClient = undefined;
        }
        if (global.redisSubClient === client) {
            global.redisSubClient = undefined;
        }
    });
    
    return client;
}


function getRedisClient(forSubscription = false): Redis {
    if (forSubscription) {
        if (!global.redisSubClient) {
            console.log('Creating new Redis subscription client...');
            global.redisSubClient = createNewClient();
        }
        return global.redisSubClient;
    }

    if (!global.redisClient) {
        console.log('Creating new Redis main client...');
        global.redisClient = createNewClient();
    }
    return global.redisClient;
}

export default getRedisClient;
