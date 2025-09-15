
import type { Room, Message, User } from './types';
import { createHash } from 'crypto';
import getRedisClient from './redis';

const ROOM_TTL_SECONDS = 2 * 60 * 60; // 2 hours in seconds
const TYPING_TIMEOUT_SECONDS = 3; // 3 seconds
const MAX_MESSAGES_PER_ROOM = 100;
const EVENTS_CHANNEL_PREFIX = 'room:events:';

export function getRoomKey(code: string): string {
    return `room:${code}`;
}

async function publishRoomUpdate(code: string, isDeletion = false) {
    const redis = getRedisClient();
    const channel = `${EVENTS_CHANNEL_PREFIX}${code}`;
    if (isDeletion) {
        // Publish a null message to indicate deletion
        await redis.publish(channel, JSON.stringify(null));
        return;
    }

    const room = await getRoom(code);
    if (room) {
        await redis.publish(channel, JSON.stringify(room));
    }
}

function generateRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
}

export async function createRoom(isPrivate = false, password?: string): Promise<string> {
    const redis = getRedisClient();
    let code: string;
    let roomKey: string;
    let roomExists: number;

    do {
        code = generateRoomCode();
        roomKey = getRoomKey(code);
        roomExists = await redis.exists(roomKey);
    } while (roomExists);

    const roomData: Omit<Room, 'messages' | 'users' | 'typing' | 'kickedUsers'> = {
        code,
        createdAt: Date.now(),
        isPrivate,
    };

    if (isPrivate && password) {
        roomData.password = hashPassword(password);
    }

    const pipeline = redis.pipeline();
    pipeline.hset(roomKey, roomData);
    pipeline.expire(roomKey, ROOM_TTL_SECONDS);
    await pipeline.exec();

    console.log(`Room created in Redis: ${code}`);
    return code;
}

export async function getRoom(code: string): Promise<Room | undefined> {
    const redis = getRedisClient();
    const roomKey = getRoomKey(code);
    const roomData = await redis.hgetall(roomKey);

    if (!Object.keys(roomData).length) {
        return undefined; // Room doesn't exist
    }

    // Fetch messages, users, typing indicators, and kicked users in parallel
    const [messages, users, typing, kickedUsers] = await Promise.all([
        redis.lrange(`${roomKey}:messages`, 0, -1),
        redis.hgetall(`${roomKey}:users`),
        redis.hgetall(`${roomKey}:typing`),
        redis.smembers(`${roomKey}:kicked`)
    ]);

    // This can happen if the room is deleted between the hgetall and the other fetches.
    if (!roomData.code) {
        return undefined;
    }

    const now = Date.now();
    const pipeline = redis.pipeline();
    let modified = false;

    // Clean up stale typing indicators
    const cleanedTyping: { [userName: string]: number } = {};
    for (const user in typing) {
        if (now - parseInt(typing[user]) < TYPING_TIMEOUT_SECONDS * 1000) {
            cleanedTyping[user] = parseInt(typing[user]);
        } else {
            pipeline.hdel(`${roomKey}:typing`, user);
            modified = true;
        }
    }
    
    if (modified) {
        await pipeline.exec();
    }
    
    return {
        code: roomData.code as string,
        createdAt: parseInt(roomData.createdAt),
        isPrivate: roomData.isPrivate === 'true',
        password: roomData.password,
        admin: roomData.admin,
        messages: messages.map(msg => JSON.parse(msg)).reverse(),
        users: Object.values(users).map(u => JSON.parse(u)).sort((a, b) => a.joinedAt - b.joinedAt),
        typing: cleanedTyping,
        kickedUsers: kickedUsers || [],
    };
}


export async function verifyPassword(code: string, password?: string): Promise<boolean> {
    const redis = getRedisClient();
    const roomKey = getRoomKey(code);
    const room = await redis.hgetall(roomKey);

    if (!Object.keys(room).length || room.isPrivate !== 'true') {
        return true; 
    }
    if (!password) {
        return false; 
    }
    return room.password === hashPassword(password);
}


export async function addMessage(code: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const redis = getRedisClient();
    const roomKey = getRoomKey(code);
    const room = await getRoom(code);
    
    if (!room) {
        throw new Error('Room not found');
    }
    
    const isUserKicked = room.kickedUsers?.includes(message.user.name);

    if (isUserKicked) {
        throw new Error('User is not authorized to send messages to this room.');
    }

    const newMessage: Message = {
        ...message,
        id: Math.random().toString(36).substring(2),
        timestamp: Date.now(),
    };
    
    const pipeline = redis.pipeline();

    pipeline.lpush(`${roomKey}:messages`, JSON.stringify(newMessage));
    pipeline.ltrim(`${roomKey}:messages`, 0, MAX_MESSAGES_PER_ROOM - 1);
    pipeline.hdel(`${roomKey}:typing`, message.user.name);

    await pipeline.exec();
    await publishRoomUpdate(code);
    return newMessage;
}

export async function updateUserTypingStatus(roomCode: string, userName: string) {
    const redis = getRedisClient();
    const roomKey = getRoomKey(roomCode);
    
    const roomExists = await redis.exists(roomKey);
    if (!roomExists) return;

    const now = Date.now();
    await redis.hset(`${roomKey}:typing`, userName, now.toString());
    await publishRoomUpdate(roomCode);
}

export async function joinRoom(roomCode: string, user: Omit<Room['users'][0], 'joinedAt'>) {
    const redis = getRedisClient();
    const roomKey = getRoomKey(roomCode);
    const room = await getRoom(roomCode);

    if (!room) {
        return;
    }
     // Check if user is on the kicked list
    if (room.kickedUsers?.includes(user.name)) {
        console.log(`Preventing kicked user ${user.name} from joining room ${roomCode}`);
        return; // Silently fail
    }
    
    const pipeline = redis.pipeline();
    
    if (!room.admin) {
        pipeline.hset(roomKey, 'admin', user.name);
    }
    
    const userKey = `${roomKey}:users`;
    const now = Date.now();
    const userData = { ...user, joinedAt: now };
    pipeline.hset(userKey, user.name, JSON.stringify(userData));
    
    await pipeline.exec();
    await publishRoomUpdate(roomCode);
}

export async function updateMessageLanguage(roomCode: string, messageId: string, language: string) {
    const redis = getRedisClient();
    const roomKey = getRoomKey(roomCode);
    const messagesKey = `${roomKey}:messages`;

    const messages = await redis.lrange(messagesKey, 0, -1);
    
    let messageToUpdate: Message | undefined;
    let messageIndex = -1;

    for (let i = 0; i < messages.length; i++) {
        const msg: Message = JSON.parse(messages[i]);
        if (msg.id === messageId) {
            messageToUpdate = msg;
            messageIndex = i;
            break;
        }
    }

    if (messageToUpdate && messageIndex !== -1) {
        messageToUpdate.language = language;
        await redis.lset(messagesKey, messageIndex, JSON.stringify(messageToUpdate));
        await publishRoomUpdate(roomCode);
    }
}

export async function kickUser(roomCode: string, adminName: string, userToKickName: string) {
    const redis = getRedisClient();
    const roomKey = getRoomKey(roomCode);

    const room = await getRoom(roomCode);
    if (!room) {
        throw new Error('Room not found.');
    }
    if (room.admin !== adminName) {
        throw new Error('Only the room admin can kick users.');
    }
    if (adminName === userToKickName) {
        throw new Error('Admin cannot kick themselves.');
    }

    const pipeline = redis.pipeline();
    // Add user to the kicked list (a Redis Set)
    pipeline.sadd(`${roomKey}:kicked`, userToKickName);
    // Remove from active users
    pipeline.hdel(`${roomKey}:users`, userToKickName);
    await pipeline.exec();

    await publishRoomUpdate(roomCode);
}

export async function deleteRoom(roomCode: string, adminName: string) {
    const redis = getRedisClient();
    const roomKey = getRoomKey(roomCode);

    const room = await getRoom(roomCode);
    if (!room) {
        return; // Room already deleted
    }

    if (room.admin !== adminName) {
        throw new Error('Only the room admin can delete the room.');
    }
    
    // Notify clients before deleting
    await publishRoomUpdate(roomCode, true);

    const pipeline = redis.pipeline();
    pipeline.del(roomKey);
    pipeline.del(`${roomKey}:messages`);
    pipeline.del(`${roomKey}:users`);
    pipeline.del(`${roomKey}:typing`);
    pipeline.del(`${roomKey}:kicked`); // Also delete the kicked list
    await pipeline.exec();

    // Close the pub/sub channel gracefully
    const subClient = getRedisClient(true);
    subClient.unsubscribe(`${EVENTS_CHANNEL_PREFIX}${roomCode}`);
}
