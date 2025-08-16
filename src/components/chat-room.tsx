'use client';

import type { Room } from '@/lib/types';
import { useEffect, useState, useRef } from 'react';
import { MessageView } from '@/components/message-view';
import { MessageForm } from '@/components/message-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

async function fetchRoom(code: string): Promise<Room | null> {
  try {
    const response = await fetch(`/api/room/${code}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch room:', error);
    return null;
  }
}

export function ChatRoom({ initialRoom }: { initialRoom: Room }) {
  const [room, setRoom] = useState<Room>(initialRoom);
  const [userName, setUserName] = useState<string>('');
  const [codeCopied, setCodeCopied] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    let user = localStorage.getItem('codeshare-user');
    if (!user) {
      user = `User-${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem('codeshare-user', user);
    }
    setUserName(user);
  }, []);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = scrollArea;
        isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 1;
      };
      scrollArea.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollArea.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    if (isAtBottomRef.current && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [room.messages]);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const updatedRoom = await fetchRoom(initialRoom.code);
      if (updatedRoom) {
        setRoom(updatedRoom);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [initialRoom.code]);


  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b bg-card">
        <h1 className="font-headline text-2xl font-bold text-primary">
          CodeShare
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Room Code:</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary cursor-pointer"
                  onClick={handleCopyCode}
                >
                  <span className="font-mono text-lg font-bold tracking-widest text-primary">
                    {room.code}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    aria-label="Copy room code"
                  >
                    {codeCopied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to copy room code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <ScrollArea className="flex-1 p-4" viewportRef={scrollAreaRef}>
        <div className="space-y-6 max-w-4xl mx-auto w-full">
          {room.messages.map((msg) => (
            <MessageView key={msg.id} message={msg} currentUser={userName} />
          ))}
          {room.messages.length === 0 && (
            <div className="text-center text-muted-foreground py-16">
              <p>No messages yet.</p>
              <p>Be the first to say something!</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <footer className="p-4 border-t bg-card">
        <div className="max-w-4xl mx-auto w-full">
          {userName ? (
            <MessageForm roomCode={room.code} userName={userName} />
          ) : (
            <p className="text-center text-muted-foreground">Loading...</p>
          )}
        </div>
      </footer>
    </div>
  );
}
