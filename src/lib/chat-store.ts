import type { Room, Message, User } from './types';
import { createHash } from 'crypto';
import getRedisClient from './redis';

const ROOM_TTL_SECONDS = 2 * 60 * 60; // 2 hours in seconds
const TYPING_TIMEOUT_SECONDS = 3; // 3 seconds
const USER_INACTIVE_TIMEOUT_SECONDS = 5 * 60; // 5 minutes
const MAX_MESSAGES_PER_ROOM = 100;

function getRoomKey(code: string): string {
    return `room:${code}`;
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

    // Retry generating a code until we find one that doesn't exist.
    // This is unlikely to loop more than once.
    do {
        code = generateRoomCode();
        roomKey = getRoomKey(code);
        roomExists = await redis.exists(roomKey);
    } while (roomExists);

    const roomData: Omit<Room, 'messages' | 'users' | 'typing'> = {
        code,
        createdAt: Date.now(),
        isPrivate,
    };

    if (isPrivate && password) {
        roomData.password = hashPassword(password);
    }

    // Use a Redis transaction to create the room and set its expiration
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

    // Fetch messages, users, and typing indicators in parallel
    const [messages, users, typing] = await Promise.all([
        redis.lrange(`${roomKey}:messages`, 0, -1),
        redis.hgetall(`${roomKey}:users`),
        redis.hgetall(`${roomKey}:typing`)
    ]);

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

    // Clean up inactive users
    const cleanedUsers: Room['users'] = [];
    for (const userName in users) {
        const userData = JSON.parse(users[userName]);
        if (now - userData.joinedAt < USER_INACTIVE_TIMEOUT_SECONDS * 1000) {
            cleanedUsers.push(userData);
        } else {
            pipeline.hdel(`${roomKey}:users`, userName);
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
        messages: messages.map(msg => JSON.parse(msg)).reverse(),
        users: cleanedUsers.sort((a, b) => a.joinedAt - b.joinedAt),
        typing: cleanedTyping,
    };
}


export async function verifyPassword(code: string, password?: string): Promise<boolean> {
    const redis = getRedisClient();
    const roomKey = getRoomKey(code);
    const room = await redis.hgetall(roomKey);

    if (!Object.keys(room).length || room.isPrivate !== 'true') {
        return true; // Not a private room, or doesn't exist
    }
    if (!password) {
        return false; // Private room but no password provided
    }
    return room.password === hashPassword(password);
}


export async function addMessage(code: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const redis = getRedisClient();
    const roomKey = getRoomKey(code);
    if (!(await redis.exists(roomKey))) {
        throw new Error('Room not found');
    }

    const newMessage: Message = {
        ...message,
        id: Math.random().toString(36).substring(2),
        timestamp: Date.now(),
    };
    
    const pipeline = redis.pipeline();

    // Push the new message and trim the list to the max size
    pipeline.lpush(`${roomKey}:messages`, JSON.stringify(newMessage));
    pipeline.ltrim(`${roomKey}:messages`, 0, MAX_MESSAGES_PER_ROOM - 1);

    // Remove the user from the typing list when they send a message
    pipeline.hdel(`${roomKey}:typing`, message.user.name);

    // Update user's last seen time to keep them active
    const userKey = `${roomKey}:users`;
    const existingUser = await redis.hget(userKey, message.user.name);
    if(existingUser) {
        const userData = JSON.parse(existingUser);
        userData.joinedAt = Date.now(); // Keep 'joinedAt' updated to track activity
        pipeline.hset(userKey, message.user.name, JSON.stringify(userData));
    }
    
    await pipeline.exec();
    return newMessage;
}

export async function updateUserTypingStatus(roomCode: string, userName: string) {
    const redis = getRedisClient();
    const roomKey = getRoomKey(roomCode);
    const userKey = `${roomKey}:users`;
    
    const [roomExists, userExists] = await Promise.all([
        redis.exists(roomKey),
        redis.hexists(userKey, userName)
    ]);

    if (!roomExists) return;

    const pipeline = redis.pipeline();
    const now = Date.now();

    // Set the typing indicator with an expiration
    pipeline.hset(`${roomKey}:typing`, userName, now.toString());
    
    // Update user's activity timestamp
    if (userExists) {
        const userDataString = await redis.hget(userKey, userName);
        if(userDataString) {
            const userData = JSON.parse(userDataString);
            userData.joinedAt = now; // Keep 'joinedAt' updated to track activity
            pipeline.hset(userKey, userName, JSON.stringify(userData));
        }
    }

    await pipeline.exec();
}

export async function joinRoom(roomCode: string, user: Omit<Room['users'][0], 'joinedAt'>) {
    const redis = getRedisClient();
    const roomKey = getRoomKey(roomCode);
    if (!(await redis.exists(roomKey))) {
        return;
    }

    const userKey = `${roomKey}:users`;
    const now = Date.now();
    
    const existingUser = await redis.hget(userKey, user.name);

    // Only add user if they are not already in the list.
    // If they are, just update their activity timestamp.
    const userData = existingUser ? JSON.parse(existingUser) : { ...user };
    userData.joinedAt = now;

    await redis.hset(userKey, user.name, JSON.stringify(userData));
}
