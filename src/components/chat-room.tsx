
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
import { Logo } from './logo';

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

const adjectives = [
  'Agile', 'Brave', 'Clever', 'Daring', 'Eager', 'Fierce', 'Gentle', 'Happy', 'Jolly', 'Keen', 'Lazy', 'Mighty',
  'Nimble', 'Proud', 'Quiet', 'Swift', 'Tricky', 'Vast', 'Witty', 'Zany'
];

const nouns = [
  // Animals
  'Ape', 'Bear', 'Cat', 'Dog', 'Eagle', 'Fox', 'Goat', 'Hawk', 'Ibex', 'Jaguar', 'Koala', 'Lion', 'Mole',
  'Nightingale', 'Ocelot', 'Panda', 'Quail', 'Rabbit', 'Snake', 'Tiger', 'Vulture', 'Walrus', 'Yak', 'Zebra',
  // Mythical Creatures
  'Dragon', 'Gryphon', 'Hydra', 'Phoenix', 'Unicorn', 'Basilisk', 'Centaur', 'Fairy', 'Gnome', 'Harpy',
  'Imp', 'Jinn', 'Kelpie', 'Leprechaun', 'Mermaid', 'Nymph', 'Orc', 'Pegasus', 'Roc', 'Satyr', 'Troll', 'Vampire',
  'Werewolf', 'Yeti'
];

function generateAnonymousName() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
}

export function ChatRoom({ initialRoom }: { initialRoom: Room }) {
  const [room, setRoom] = useState<Room>(initialRoom);
  const [userName, setUserName] = useState<string>('');
  const [codeCopied, setCodeCopied] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    let name = sessionStorage.getItem(`codeyapp-user-${initialRoom.code}`);
    if (!name) {
      name = generateAnonymousName();
      sessionStorage.setItem(`codeyapp-user-${initialRoom.code}`, name);
    }
    setUserName(name);
  }, [initialRoom.code]);

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
    <div className="flex flex-col h-screen bg-background overflow-x-hidden">
      <header className="flex items-center justify-between p-2 sm:p-4 border-b bg-card">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/">
            <Logo variant="small" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm text-muted-foreground">Room:</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md bg-secondary cursor-pointer"
                    onClick={handleCopyCode}
                  >
                    <span className="font-mono text-base sm:text-lg font-bold tracking-widest text-primary">
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
        <Button variant="ghost" asChild size="sm">
          <Link href="/">
            <LogOut className="w-4 h-4 mr-0 sm:mr-2" />
            <span className="hidden sm:inline">Leave Room</span>
          </Link>
        </Button>
      </header>

      <ScrollArea className="flex-1 p-2 sm:p-4" viewportRef={scrollAreaRef}>
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

      <footer className="p-2 sm:p-4 border-t bg-card">
        <div className="max-w-4xl mx-auto w-full">
          {userName ? (
            <MessageForm roomCode={room.code} userName={userName} />
          ) : (
            <p className="text-center text-muted-foreground">Joining room...</p>
          )}
        </div>
      </footer>
    </div>
  );
}
