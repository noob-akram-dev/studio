import type { Room, Message } from './types';
import fs from 'fs';
import path from 'path';

// This is a simple file-based store.
// In a real-world serverless environment, you'd use a database like Firestore or Redis.
const dataDir = path.join(process.cwd(), 'data');
const roomsDir = path.join(dataDir, 'rooms');

if (!fs.existsSync(roomsDir)) {
  fs.mkdirSync(roomsDir, { recursive: true });
}

function getRoomFilePath(code: string): string {
    return path.join(roomsDir, `${code}.json`);
}

function generateRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function createRoom(): string {
  let code: string;
  let filePath: string;
  do {
    code = generateRoomCode();
    filePath = getRoomFilePath(code);
  } while (fs.existsSync(filePath));

  const newRoom: Room = {
    code,
    messages: [],
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
        return JSON.parse(fileContent);
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
