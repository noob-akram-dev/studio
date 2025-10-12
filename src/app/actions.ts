
'use server';

import { redirect } from 'next/navigation';
import { addMessage, createRoom, getRoom, updateUserTypingStatus, joinRoom, verifyPassword, updateMessageDetails, kickUser, deleteRoom } from '@/lib/chat-store';
import type { User, Room, Message } from '@/lib/types';
import { explainAndIdentifyCode } from '@/ai/flows/explain-and-identify-code';
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

async function detectAndExplainCode(roomCode: string, messageId: string, text: string) {
    try {
        if (isCodeBlock(text)) {
            const code = text.replace(/```/g, '');
            const result = await explainAndIdentifyCode({ code });
            if (result.language && result.language.toLowerCase() !== 'unknown') {
                 await updateMessageDetails(roomCode, messageId, { 
                    language: result.language,
                    explanation: result.explanation,
                 });
            }
        }
    } catch (error) {
        console.error('Failed to process code in background:', error);
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
  const fileUrl = formData.get('fileUrl') as string | undefined;
  const fileName = formData.get('fileName') as string | undefined;
  const fileType = formData.get('fileType') as string | undefined;

  if (!text && !fileUrl) {
    return { error: 'A message or a file is required.' };
  }

  if (!roomCode || !userName) {
    return { error: 'Missing required fields.' };
  }

  const user: User = { id: userName, name: userName, avatarUrl: userAvatarUrl };
  
  try {
    const newMessage = await addMessage(roomCode, {
      text,
      user,
      fileUrl,
      fileName,
      fileType
    });

    // Don't await this. Let it run in the background.
    if (text) {
      detectAndExplainCode(roomCode, newMessage.id, text);
    }
  
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
    const userToKickName = formData.get('userToKickName') as string;

    if (!roomCode || !adminName || !userToKickName) {
        return { error: 'Missing required fields' };
    }

    try {
        await kickUser(roomCode, adminName, userToKickName);
        revalidatePath(`/room/${roomCode}`);
        return { success: true };
    } catch(error: any) {
        return { error: error.message };
    }
}

export async function deleteRoomAction(formData: FormData) {
    const roomCode = formData.get('roomCode') as string;
    const adminName = formData.get('adminName') as string;

     if (!roomCode || !adminName) {
        return { error: 'Missing required fields' };
    }

    try {
        await deleteRoom(roomCode, adminName);
    } catch (error: any) {
        return { error: error.message };
    }

    redirect('/');
}

