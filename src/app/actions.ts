
'use server';

import { redirect } from 'next/navigation';
import { addMessage, createRoom, getRoom, updateUserTypingStatus, joinRoom, verifyPassword, updateMessageLanguage, kickUser, deleteRoom, removeUserFromRoom } from '@/lib/chat-store';
import type { User, Room, Message } from '@/lib/types';
import { detectProgrammingLanguage } from '@/ai/flows/detect-programming-language';
import { revalidatePath } from 'next/cache';

export async function createRoomAction(formData: FormData) {
  const isPrivate = formData.get('private') === 'true';
  const password = formData.get('password') as string | undefined;

  if (isPrivate && (!password || password.length < 4)) {
      redirect('/?error=password_too_short');
      return;
  }
  
  const code = await createRoom(isPrivate, password);
  redirect(`/room/${code}`);
}

export async function joinRoomAction(formData: FormData) {
  const code = formData.get('code') as string;
  const password = formData.get('password') as string | undefined;

  if (!code) {
    return { error: 'Room code is required.' };
  }

  const room = await getRoom(code);
  if (!room) {
    redirect('/?error=not_found');
    return;
  }

  if (room.isPrivate) {
    if (!await verifyPassword(code, password)) {
        redirect(`/?error=invalid_password&code=${code}`);
        return;
    }
  }
  
  redirect(`/room/${code}`);
}

const isCodeBlock = (text: string) => text.trim().startsWith('```');

async function detectAndSetLanguage(roomCode: string, messageId: string, text: string) {
    try {
        if (isCodeBlock(text)) {
            const result = await detectProgrammingLanguage({ code: text });
            if (result.language && result.language !== 'Unknown') {
                 await updateMessageLanguage(roomCode, messageId, result.language);
            }
        }
    } catch (error) {
        console.error('Failed to detect language in background:', error);
    }
}

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
  
  try {
    const newMessage = await addMessage(roomCode, {
      text,
      user,
      language: undefined,
    });

    // Don't await this. Let it run in the background.
    detectAndSetLanguage(roomCode, newMessage.id, text);
  
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
  
  await updateUserTypingStatus(roomCode, userName);
}

export async function joinRoomAndAddUserAction(formData: FormData) {
    const roomCode = formData.get('roomCode') as string;
    const userName = formData.get('userName') as string;
    const userAvatarUrl = formData.get('userAvatarUrl') as string;

    if (!roomCode || !userName || !userAvatarUrl) {
        return;
    }

    await joinRoom(roomCode, { name: userName, avatarUrl: userAvatarUrl });
}

export async function kickUserAction(formData: FormData) {
    const roomCode = formData.get('roomCode') as string;
    const adminName = formData.get('adminName') as string;
    const userNameToKick = formData.get('userNameToKick') as string;

    if (!roomCode || !adminName || !userNameToKick) {
        return;
    }

    await kickUser(roomCode, adminName, userNameToKick);
}

export async function deleteRoomAction(formData: FormData) {
    const roomCode = formData.get('roomCode') as string;
    const adminName = formData.get('adminName') as string;

    if (!roomCode || !adminName) {
        return;
    }
    
    await deleteRoom(roomCode, adminName);
}

export async function removeUserFromRoomAction(formData: FormData) {
    const roomCode = formData.get('roomCode') as string;
    const userName = formData.get('userName') as string;

    if (!roomCode || !userName) {
        return;
    }
    
    await removeUserFromRoom(roomCode, userName);
}
