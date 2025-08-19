import type { Room, Message } from './types';
import fs from 'fs';
import path from 'path';

// This is a simple file-based store.
// In a real-world serverless environment, you'd use a database like Firestore or Redis.
const dataDir = path.join(process.cwd(), 'data');
const roomsDir = path.join(dataDir, 'rooms');
const ROOM_TTL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

if (!fs.existsSync(roomsDir)) {
  fs.mkdirSync(roomsDir, { recursive: true });
}

function getRoomFilePath(code: string): string {
    return path.join(roomsDir, `${code}.json`);
}

function generateRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
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

export function createRoom(): string {
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
  };
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
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const room: Room = JSON.parse(fileContent);

        // Check if the room has expired
        if (Date.now() - room.createdAt > ROOM_TTL) {
            fs.unlinkSync(filePath); // Delete the expired room file
            console.log(`Lazily deleted expired room: ${code}`);
            return undefined;
        }

        return room;
    } catch (error) {
        console.error(`Error reading room ${code}:`, error);
        return undefined;
    }
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
  const filePath = getRoomFilePath(code);
  fs.writeFileSync(filePath, JSON.stringify(room, null, 2));
  return newMessage;
}
