
import type { Room, Message, User } from './types';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';


// This is a simple file-based store.
// In a real-world serverless environment, you'd use a database like Firestore or Redis.
const dataDir = path.join(process.cwd(), 'data');
const roomsDir = path.join(dataDir, 'rooms');
const ROOM_TTL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const TYPING_TIMEOUT = 3000; // 3 seconds
const USER_INACTIVE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const MAX_MESSAGES_PER_ROOM = 100; // Cap the number of messages to prevent performance issues.

if (!fs.existsSync(roomsDir)) {
  fs.mkdirSync(roomsDir, { recursive: true });
}

function getRoomFilePath(code: string): string {
    return path.join(roomsDir, `${code}.json`);
}

function generateRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
}

function cleanupExpiredRooms() {
  console.log('Running cleanup for expired rooms...');
  try {
    const files = fs.readdirSync(roomsDir);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const filePath = path.join(roomsDir, file);
        try {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const room = JSON.parse(fileContent);
          if (room.createdAt && (Date.now() - room.createdAt > ROOM_TTL)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted expired room: ${room.code}`);
          }
        } catch (error) {
          console.error(`Error processing or deleting room file ${file}:`, error);
          // If file is corrupt, delete it.
          if (error instanceof SyntaxError) {
            fs.unlinkSync(filePath);
            console.log(`Deleted corrupt room file: ${file}`);
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to cleanup expired rooms:', error);
  }
}

export function createRoom(isPrivate = false, password?: string): string {
  cleanupExpiredRooms(); // Run cleanup every time a new room is requested.

  let code: string;
  let filePath: string;
  do {
    code = generateRoomCode();
    filePath = getRoomFilePath(code);
  } while (fs.existsSync(filePath));

  const newRoom: Room = {
    code,
    messages: [],
    createdAt: Date.now(),
    typing: {},
    users: [],
    isPrivate,
  };

  if (isPrivate && password) {
    newRoom.password = hashPassword(password);
  }

  fs.writeFileSync(filePath, JSON.stringify(newRoom, null, 2));
  console.log(`Room created: ${code}`);
  return code;
}

export function getRoom(code: string): Room | undefined {
    const filePath = getRoomFilePath(code);
    if (!fs.existsSync(filePath)) {
        return undefined;
    }
    try {
        let fileContent = fs.readFileSync(filePath, 'utf-8');
        let room: Room = JSON.parse(fileContent);

        // Check if the room has expired
        if (Date.now() - room.createdAt > ROOM_TTL) {
            fs.unlinkSync(filePath); // Delete the expired room file
            console.log(`Lazily deleted expired room: ${code}`);
            return undefined;
        }

        let modified = false;

        // Clean up stale typing indicators
        if (room.typing) {
            const now = Date.now();
            for (const user in room.typing) {
                if (now - room.typing[user] > TYPING_TIMEOUT) {
                    delete room.typing[user];
                    modified = true;
                }
            }
        }
        
        // Clean up inactive users
        if (room.users) {
            const now = Date.now();
            const initialUserCount = room.users.length;
            room.users = room.users.filter(user => (now - user.joinedAt) < USER_INACTIVE_TIMEOUT);
            if(room.users.length !== initialUserCount) {
                modified = true;
            }
        }


        if (modified) {
             fs.writeFileSync(filePath, JSON.stringify(room, null, 2));
        }


        return room;
    } catch (error) {
        console.error(`Error reading room ${code}:`, error);
        return undefined;
    }
}

export function verifyPassword(code: string, password?: string): boolean {
    const room = getRoom(code);
    if (!room || !room.isPrivate) {
        return true; // Not a private room, or doesn't exist
    }
    if (!password) {
        return false; // Private room but no password provided
    }
    return room.password === hashPassword(password);
}


export function addMessage(code: string, message: Omit<Message, 'id' | 'timestamp'>): Message {
  const room = getRoom(code);
  if (!room) {
    throw new Error('Room not found');
  }

  const newMessage: Message = {
    ...message,
    id: Math.random().toString(36).substring(2),
    timestamp: Date.now(),
  };

  room.messages.push(newMessage);

  // If messages exceed the limit, truncate the oldest ones.
  if (room.messages.length > MAX_MESSAGES_PER_ROOM) {
    room.messages = room.messages.slice(room.messages.length - MAX_MESSAGES_PER_ROOM);
  }

  // Remove the user from the typing list when they send a message
  if (room.typing && room.typing[message.user.name]) {
    delete room.typing[message.user.name];
  }

  // Update user's last seen time
  const userIndex = room.users.findIndex(u => u.name === message.user.name);
  if (userIndex !== -1) {
    room.users[userIndex].joinedAt = Date.now();
  }
  
  const filePath = getRoomFilePath(code);
  fs.writeFileSync(filePath, JSON.stringify(room, null, 2));
  return newMessage;
}

export function updateUserTypingStatus(roomCode: string, userName: string) {
  const room = getRoom(roomCode);
  if (!room) {
    return;
  }
  
  if (!room.typing) {
    room.typing = {};
  }
  room.typing[userName] = Date.now();
  
  // Update user's last seen time
  const userIndex = room.users.findIndex(u => u.name === userName);
  if (userIndex !== -1) {
    room.users[userIndex].joinedAt = Date.now();
  }

  const filePath = getRoomFilePath(roomCode);
  fs.writeFileSync(filePath, JSON.stringify(room, null, 2));
}

export function joinRoom(roomCode: string, user: Omit<Room['users'][0], 'joinedAt'>) {
  const room = getRoom(roomCode);
  if (!room) {
    return;
  }
  if (!room.users) {
    room.users = [];
  }
  const userIndex = room.users.findIndex(u => u.name === user.name);
  if (userIndex !== -1) {
    room.users[userIndex].joinedAt = Date.now();
  } else {
    room.users.push({ ...user, joinedAt: Date.now() });
  }

  const filePath = getRoomFilePath(roomCode);
  fs.writeFileSync(filePath, JSON.stringify(room, null, 2));
}
