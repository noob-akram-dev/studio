'use server';

import { redirect } from 'next/navigation';
import { addMessage, createRoom, getRoom } from '@/lib/chat-store';
import type { User } from '@/lib/types';
import { detectProgrammingLanguage } from '@/ai/flows/detect-programming-language';

export async function createRoomAction(formData: FormData) {
  const userName = formData.get('userName') as string;
  if (!userName) {
    // This should ideally be handled on the client-side, but as a fallback
    return { error: 'Username is required.' };
  }
  const code = createRoom();
  redirect(`/room/${code}?userName=${encodeURIComponent(userName)}`);
}

export async function joinRoomAction(formData: FormData) {
  const code = formData.get('code') as string;
  const userName = formData.get('userName') as string;

  if (!code || !userName) {
    return { error: 'Room code and username are required.' };
  }

  if (getRoom(code)) {
    redirect(`/room/${code}?userName=${encodeURIComponent(userName)}`);
  } else {
    redirect('/?error=not_found');
  }
}

const isCodeBlock = (text: string) => text.trim().startsWith('```');

export async function sendMessageAction(
  prevState: any,
  formData: FormData
) {
  const text = formData.get('message') as string;
  const roomCode = formData.get('roomCode') as string;
  const userName = formData.get('userName') as string;

  if (!text || !roomCode || !userName) {
    return { error: 'Missing required fields.' };
  }

  const user: User = { id: userName, name: userName };
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
  
    return { success: true };

  } catch (error) {
    console.error('Failed to send message:', error);
    return { error: 'Could not send message. Please try again.' };
  }
}
