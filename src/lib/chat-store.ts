import type { Room, Message } from './types';

// This is a simple in-memory store.
// In a real-world serverless environment, you'd use a database like Firestore or Redis.
// This works for local development and single-instance deployments.
const rooms = new Map<string, Room>();

function generateRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function createRoom(): string {
  let code: string;
  do {
    code = generateRoomCode();
  } while (rooms.has(code));

  const newRoom: Room = {
    code,
    messages: [],
  };
  rooms.set(code, newRoom);
  console.log(`Room created: ${code}`);
  return code;
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code);
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
  return newMessage;
}
