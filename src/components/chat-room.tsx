'use client';

import type { Room } from '@/lib/types';
import { useEffect, useState, useRef } from 'react';
import { MessageView } from '@/components/message-view';
import { MessageForm } from '@/components/message-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Copy, Check, LogOut } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

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

function SetNameDialog({
  open,
  onNameSet,
}: {
  open: boolean;
  onNameSet: (name: string) => void;
}) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSet(name.trim());
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()} hideCloseButton={true}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Welcome!</DialogTitle>
            <DialogDescription>
              Please enter your name to join the chat.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="submit">Join Chat</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ChatRoom({ initialRoom }: { initialRoom: Room }) {
  const [room, setRoom] = useState<Room>(initialRoom);
  const [userName, setUserName] = useState<string>('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    const user = localStorage.getItem('codeshare-user');
    if (user) {
      setUserName(user);
    } else {
      setIsNameModalOpen(true);
    }
  }, []);

  const handleNameSet = (name: string) => {
    localStorage.setItem('codeshare-user', name);
    setUserName(name);
    setIsNameModalOpen(false);
  };

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
    if (!userName) return; // Don't start polling until we have a username

    const interval = setInterval(async () => {
      const updatedRoom = await fetchRoom(initialRoom.code);
      if (updatedRoom) {
        setRoom(updatedRoom);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [initialRoom.code, userName]);


  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <h1 className="font-headline text-2xl font-bold text-primary">
            CodeShare
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Room:</span>
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
        </div>
        <Button variant="ghost" asChild>
          <Link href="/">
            <LogOut />
            Leave Room
          </Link>
        </Button>
      </header>

      <ScrollArea className="flex-1 p-4" viewportRef={scrollAreaRef}>
        <div className="space-y-4 max-w-4xl mx-auto w-full">
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
            <p className="text-center text-muted-foreground">Joining room...</p>
          )}
        </div>
      </footer>
      <SetNameDialog open={isNameModalOpen} onNameSet={handleNameSet} />
    </div>
  );
}
