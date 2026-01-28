import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';
import type { Room, Message, User } from './types';
import { createHash } from 'crypto';

// Initialize Firebase Admin for server-side operations
function getAdminDb() {
  if (getApps().length === 0) {
    // For Firebase App Hosting, credentials are auto-injected
    // For local dev, use GOOGLE_APPLICATION_CREDENTIALS env var
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
  return getAdminFirestore();
}

const ROOM_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const MAX_MESSAGES_PER_ROOM = 100;

export function getRoomKey(code: string): string {
  return code;
}

function generateRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function createRoom(isPrivate = false, password?: string): Promise<string> {
  const db = getAdminDb();
  let code: string;
  let roomRef;
  let roomExists;

  // Generate unique code
  do {
    code = generateRoomCode();
    roomRef = db.collection('rooms').doc(code);
    const snapshot = await roomRef.get();
    roomExists = snapshot.exists;
  } while (roomExists);

  const now = Date.now();
  const expiresAt = new Date(now + ROOM_TTL_MS);

  const roomData = {
    code,
    createdAt: now,
    expiresAt: expiresAt,
    isPrivate,
    password: isPrivate && password ? hashPassword(password) : null,
    admin: null,
    messages: [],
    users: [],
    typing: {},
    kickedUsers: [],
    pinnedMessageId: null,
  };

  await roomRef.set(roomData);
  console.log(`Room created in Firestore: ${code}`);
  return code;
}

export async function getRoom(code: string): Promise<Room | undefined> {
  const db = getAdminDb();
  const roomRef = db.collection('rooms').doc(code);
  const snapshot = await roomRef.get();

  if (!snapshot.exists) {
    return undefined;
  }

  const data = snapshot.data()!;

  // Check if room has expired
  const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt);
  if (expiresAt < new Date()) {
    // Room expired, delete it
    await roomRef.delete();
    return undefined;
  }

  // Clean up stale typing indicators (older than 3 seconds)
  const now = Date.now();
  const cleanedTyping: { [userName: string]: number } = {};
  const typing = data.typing || {};

  for (const user in typing) {
    if (now - typing[user] < 3000) {
      cleanedTyping[user] = typing[user];
    }
  }

  return {
    code: data.code,
    createdAt: data.createdAt,
    isPrivate: data.isPrivate || false,
    password: data.password,
    admin: data.admin,
    messages: (data.messages || []).slice(-MAX_MESSAGES_PER_ROOM),
    users: (data.users || []).sort((a: any, b: any) => a.joinedAt - b.joinedAt),
    typing: cleanedTyping,
    kickedUsers: data.kickedUsers || [],
  };
}

export async function verifyPassword(code: string, password?: string): Promise<boolean> {
  const db = getAdminDb();
  const roomRef = db.collection('rooms').doc(code);
  const snapshot = await roomRef.get();

  if (!snapshot.exists) {
    return true;
  }

  const data = snapshot.data()!;

  if (!data.isPrivate) {
    return true;
  }

  if (!password) {
    return false;
  }

  return data.password === hashPassword(password);
}

export async function addMessage(code: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
  const db = getAdminDb();
  const roomRef = db.collection('rooms').doc(code);
  const snapshot = await roomRef.get();

  if (!snapshot.exists) {
    throw new Error('Room not found');
  }

  const data = snapshot.data()!;
  const kickedUsers = data.kickedUsers || [];

  if (kickedUsers.includes(message.user.name)) {
    throw new Error('User is not authorized to send messages to this room.');
  }

  const newMessage: Message = {
    ...message,
    id: Math.random().toString(36).substring(2),
    timestamp: Date.now(),
  };

  // Get current messages, add new one, keep only last MAX_MESSAGES_PER_ROOM
  const messages = data.messages || [];
  messages.push(newMessage);
  const trimmedMessages = messages.slice(-MAX_MESSAGES_PER_ROOM);

  // Remove typing indicator for this user
  const typing = { ...data.typing };
  delete typing[message.user.name];

  await roomRef.update({
    messages: trimmedMessages,
    typing,
  });

  return newMessage;
}

export async function updateUserTypingStatus(roomCode: string, userName: string) {
  const db = getAdminDb();
  const roomRef = db.collection('rooms').doc(roomCode);
  const snapshot = await roomRef.get();

  if (!snapshot.exists) return;

  const now = Date.now();
  await roomRef.update({
    [`typing.${userName}`]: now,
  });
}

export async function joinRoom(roomCode: string, user: Omit<Room['users'][0], 'joinedAt'>) {
  const db = getAdminDb();
  const roomRef = db.collection('rooms').doc(roomCode);
  const snapshot = await roomRef.get();

  if (!snapshot.exists) {
    return;
  }

  const data = snapshot.data()!;
  const kickedUsers = data.kickedUsers || [];

  // Check if user is on the kicked list
  if (kickedUsers.includes(user.name)) {
    console.log(`Preventing kicked user ${user.name} from joining room ${roomCode}`);
    return;
  }

  const users = data.users || [];
  const existingUser = users.find((u: any) => u.name === user.name);

  const updateData: any = {};

  // Set admin if not set
  if (!data.admin) {
    updateData.admin = user.name;
  }

  if (!existingUser) {
    const now = Date.now();
    const userData = { ...user, joinedAt: now };
    updateData.users = [...users, userData];
  }

  if (Object.keys(updateData).length > 0) {
    await roomRef.update(updateData);
  }
}

export async function updateMessageDetails(
  roomCode: string,
  messageId: string,
  details: { language?: string; explanation?: string }
) {
  const db = getAdminDb();
  const roomRef = db.collection('rooms').doc(roomCode);
  const snapshot = await roomRef.get();

  if (!snapshot.exists) return;

  const data = snapshot.data()!;
  const messages = data.messages || [];

  const updatedMessages = messages.map((msg: Message) => {
    if (msg.id === messageId) {
      return { ...msg, ...details };
    }
    return msg;
  });

  await roomRef.update({ messages: updatedMessages });
}

export async function kickUser(roomCode: string, adminName: string, userToKickName: string) {
  const db = getAdminDb();
  const roomRef = db.collection('rooms').doc(roomCode);
  const snapshot = await roomRef.get();

  if (!snapshot.exists) {
    throw new Error('Room not found.');
  }

  const data = snapshot.data()!;

  if (data.admin !== adminName) {
    throw new Error('Only the room admin can kick users.');
  }

  if (adminName === userToKickName) {
    throw new Error('Admin cannot kick themselves.');
  }

  const users = (data.users || []).filter((u: any) => u.name !== userToKickName);
  const kickedUsers = [...(data.kickedUsers || []), userToKickName];

  await roomRef.update({
    users,
    kickedUsers,
  });
}

export async function deleteRoom(roomCode: string, adminName: string) {
  const db = getAdminDb();
  const roomRef = db.collection('rooms').doc(roomCode);
  const snapshot = await roomRef.get();

  if (!snapshot.exists) {
    return; // Room already deleted
  }

  const data = snapshot.data()!;

  if (data.admin !== adminName) {
    throw new Error('Only the room admin can delete the room.');
  }

  // Mark as deleted before removing (for real-time listeners to detect)
  await roomRef.update({ deleted: true });

  // Then delete the document
  await roomRef.delete();
}

export async function removeUserFromRoom(roomCode: string, userName: string) {
  const db = getAdminDb();
  const roomRef = db.collection('rooms').doc(roomCode);
  const snapshot = await roomRef.get();

  if (!snapshot.exists) return;

  const data = snapshot.data()!;
  const users = (data.users || []).filter((u: any) => u.name !== userName);
  const typing = { ...data.typing };
  delete typing[userName];

  await roomRef.update({ users, typing });
}

export async function pinMessage(roomCode: string, adminName: string, messageId: string | null) {
  const db = getAdminDb();
  const roomRef = db.collection('rooms').doc(roomCode);
  const snapshot = await roomRef.get();

  if (!snapshot.exists) {
    throw new Error('Room not found.');
  }

  const data = snapshot.data()!;

  if (data.admin !== adminName) {
    throw new Error('Only the room admin can pin messages.');
  }

  // If messageId is null, unpin the current message
  await roomRef.update({ pinnedMessageId: messageId });
}
