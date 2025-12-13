
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
    console.log('Creating new Redis client...');
    const client = new Redis(redisUrl, {
        // These options are important for serverless environments
        lazyConnect: true, 
        showFriendlyErrorStack: true,
        enableAutoPipelining: true,
        maxRetriesPerRequest: 0,
        retryStrategy: (times) => {
            // No retries
            return null;
        },
    });

    client.on('error', (err) => {
        console.error('Redis Client Error:', err);
    });

    return client;
}


/**
 * Gets a cached Redis client instance.
 * In a serverless environment, global variables are reused across invocations within the same container.
 * This function ensures we don't create a new connection for every single request.
 * @param forSubscription - Set to true if you need a client for Pub/Sub operations.
 */
function getRedisClient(forSubscription = false): Redis {
    const globalKey = forSubscription ? 'redisSubClient' : 'redisClient';

    // Check if the client exists and its status is not 'end' (closed)
    if (!global[globalKey] || global[globalKey]?.status === 'end') {
        global[globalKey] = createNewClient();
    }
    
    return global[globalKey]!;
}

export default getRedisClient;

