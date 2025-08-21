'use server';

import { redirect } from 'next/navigation';
import { addMessage, createRoom, getRoom, updateUserTypingStatus, joinRoom, verifyPassword } from '@/lib/chat-store';
import type { User, Room } from '@/lib/types';
import { detectProgrammingLanguage } from '@/ai/flows/detect-programming-language';
import { revalidatePath } from 'next/cache';

export async function createRoomAction(formData: FormData) {
  const isPrivate = formData.get('private') === 'true';
  const password = formData.get('password') as string | undefined;

  if (isPrivate && (!password || password.length < 4)) {
      redirect('/?error=password_too_short');
      return;
  }
  
  const code = createRoom(isPrivate, password);
  redirect(`/room/${code}`);
}

export async function joinRoomAction(formData: FormData) {
  const code = formData.get('code') as string;
  const password = formData.get('password') as string | undefined;

  if (!code) {
    return { error: 'Room code is required.' };
  }

  const room = getRoom(code);
  if (!room) {
    redirect('/?error=not_found');
    return;
  }

  if (room.isPrivate) {
    if (!verifyPassword(code, password)) {
        redirect(`/?error=invalid_password&code=${code}`);
        return;
    }
  }
  
  redirect(`/room/${code}`);
}

const isCodeBlock = (text: string) => text.trim().startsWith('```');

export async function sendMessageAction(
  prevState: any,
  formData: FormData
) {
  const text = formData.get('message') as string;
  const roomCode = formData.get('roomCode') as string;
  const userName = formData.get('userName') as string;
  const userAvatarUrl = formData.get('userAvatarUrl') as string;

  if (!text || !roomCode || !userName) {
    return { error: 'Missing required fields.' };
  }

  const user: User = { id: userName, name: userName, avatarUrl: userAvatarUrl };
  let language: string | undefined = undefined;

  try {
    if (isCodeBlock(text)) {
      const result = await detectProgrammingLanguage({ code: text });
      language = result.language;
    }

    addMessage(roomCode, {
      text,
      user,
      language,
    });
  
    revalidatePath(`/api/room/${roomCode}`);
    return { success: true };

  } catch (error) {
    console.error('Failed to send message:', error);
    return { error: 'Could not send message. Please try again.' };
  }
}

export async function userTypingAction(formData: FormData) {
  const roomCode = formData.get('roomCode') as string;
  const userName = formData.get('userName') as string;

  if (!roomCode || !userName) {
    return;
  }
  
  updateUserTypingStatus(roomCode, userName);
  // We don't need to revalidate here as the client is already polling for updates.
}

export async function joinRoomAndAddUserAction(formData: FormData) {
    const roomCode = formData.get('roomCode') as string;
    const userName = formData.get('userName') as string;
    const userAvatarUrl = formData.get('userAvatarUrl') as string;

    if (!roomCode || !userName || !userAvatarUrl) {
        return;
    }

    joinRoom(roomCode, { name: userName, avatarUrl: userAvatarUrl });
}
