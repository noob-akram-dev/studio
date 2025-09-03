
'use client';

import type { Room } from '@/lib/types';
import { useEffect, useState, useRef, useMemo } from 'react';
import { MessageView } from '@/components/message-view';
import { MessageForm } from '@/components/message-form';
import { Button } from '@/components/ui/button';
import { Copy, Check, LogOut, Share2, Trash, Crown, ShieldX } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from 'next/link';
import { Logo } from './logo';
import { CountdownTimer } from './countdown-timer';
import { TypingIndicator } from './typing-indicator';
import { joinRoomAndAddUserAction, deleteRoomAction } from '@/app/actions';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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

const getAvatarUrl = (name: string) => `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${encodeURIComponent(name)}`;

export function ChatRoom({ initialRoom }: { initialRoom: Room }) {
  const [room, setRoom] = useState<Room>(initialRoom);
  const [userName, setUserName] = useState<string>('');
  const [userAvatarUrl, setUserAvatarUrl] = useState<string>('');
  const [codeCopied, setCodeCopied] = useState(false);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const { toast } = useToast();
  const router = useRouter();

  const isAdmin = useMemo(() => room.admin === userName && userName !== '', [room.admin, userName]);
  
  const lastMessageId = room.messages.length > 0 ? room.messages[room.messages.length - 1].id : null;

  useEffect(() => {
    let name = sessionStorage.getItem(`codeyapp-user-${initialRoom.code}`);
    if (!name) {
      name = generateAnonymousName();
      sessionStorage.setItem(`codeyapp-user-${initialRoom.code}`, name);
    }
    setUserName(name);
    const avatarUrl = getAvatarUrl(name);
    setUserAvatarUrl(avatarUrl);

    if (name) {
        const formData = new FormData();
        formData.append('roomCode', initialRoom.code);
        formData.append('userName', name);
        formData.append('userAvatarUrl', avatarUrl);
        joinRoomAndAddUserAction(formData);
    }

  }, [initialRoom.code]);

  useEffect(() => {
    const eventSource = new EventSource(`/api/room/${initialRoom.code}/events`);
    
    eventSource.onmessage = (event) => {
        const updatedData = JSON.parse(event.data);

        if (updatedData.deleted) {
            toast({
                title: "Room Deleted by Admin",
                description: "You will be redirected to the homepage.",
            });
            setTimeout(() => router.push('/'), 2000);
            eventSource.close();
            return;
        }

        setRoom(updatedData);
    };

    eventSource.onerror = (err) => {
        console.error("EventSource failed:", err);
        eventSource.close();
    };

    // Cleanup on component unmount
    return () => {
        eventSource.close();
    };
  }, [initialRoom.code, router, toast]);
  
  useEffect(() => {
    if (virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({
        index: room.messages.length - 1,
        align: 'end',
        behavior: 'smooth',
      });
    }
  }, [lastMessageId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };
  
  const handleShareLink = () => {
      const url = `${window.location.origin}/?code=${room.code}`;
      navigator.clipboard.writeText(url);
      toast({
          title: "Link Copied!",
          description: "A shareable link has been copied to your clipboard.",
      });
  }

  const handleDeleteRoom = () => {
      if (!isAdmin) return;
      const formData = new FormData();
      formData.append('roomCode', room.code);
      formData.append('adminName', userName);
      deleteRoomAction(formData);
  }

  const typingUsers = useMemo(() => {
    if (!room.typing || !userName) {
      return [];
    }
    const now = Date.now();
    return Object.entries(room.typing)
      .filter(([name, timestamp]) => name !== userName && (now - timestamp < 3000))
      .map(([name]) => name);
  }, [room.typing, userName]);

  const activeUsers = useMemo(() => {
      return room.users || [];
  }, [room.users]);


  return (
    <div className="flex flex-col h-screen bg-background overflow-x-hidden">
      <header className="flex items-center justify-between p-2 md:p-4 border-b bg-card">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/">
            <Logo variant="small" />
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="hidden md:inline text-base text-muted-foreground">Room:</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary cursor-pointer"
                    onClick={handleCopyCode}
                  >
                    <span className="font-mono text-lg md:text-xl font-bold text-primary">
                      {room.code}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label="Copy room code"
                    >
                      {codeCopied ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to copy room code</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button onClick={handleShareLink} variant="ghost" size="icon" className="h-9 w-9">
                            <Share2 className="w-5 h-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Copy Share Link</p>
                    </TooltipContent>
                </Tooltip>
             </TooltipProvider>
          </div>
           <div className="hidden md:flex">
             <CountdownTimer createdAt={room.createdAt} />
           </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
        {isAdmin && (
             <AlertDialog>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                                 <Button variant="destructive">
                                    <Trash className="w-4 h-4 mr-0 md:mr-2" />
                                    <span className="hidden md:inline">End Room</span>
                                </Button>
                            </AlertDialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>End Room & Delete for Everyone</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action is irreversible. The room and all its messages will be permanently deleted for all users.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteRoom}>
                        Yes, End Room
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
        <Button variant="ghost" asChild>
          <Link href="/">
            <LogOut className="w-4 h-4 mr-0 md:mr-2" />
            <span className="hidden md:inline">Leave Room</span>
          </Link>
        </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <Virtuoso
            ref={virtuosoRef}
            className="h-full w-full"
            totalCount={room.messages.length}
            initialTopMostItemIndex={room.messages.length - 1}
            followOutput={'auto'}
            itemContent={index => {
              const msg = room.messages[index];
              return (
                <div className="p-2 sm:p-4 max-w-4xl mx-auto w-full">
                  <MessageView key={msg.id} message={msg} currentUser={userName} />
                </div>
              );
            }}
            components={{
              Footer: () => (
                <div className="p-2 sm:p-4 max-w-4xl mx-auto w-full">
                   <TypingIndicator users={typingUsers} />
                </div>
              ),
              EmptyPlaceholder: () => (
                  <div className="text-center text-muted-foreground py-16">
                    <p>No messages yet.</p>
                    <p>Be the first to say something!</p>
                  </div>
              )
            }}
          />
      </main>

      <footer className="p-2 sm:p-4 border-t bg-card">
        <div className="max-w-4xl mx-auto w-full">
          {userName ? (
            <MessageForm roomCode={room.code} userName={userName} userAvatarUrl={userAvatarUrl} users={activeUsers} isAdmin={isAdmin} roomAdminName={room.admin} />
          ) : (
            <p className="text-center text-muted-foreground">Joining room...</p>
          )}
        </div>
      </footer>
    </div>
  );
}
