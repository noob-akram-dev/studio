
'use client';

import type { Room } from '@/lib/types';
import { useEffect, useState, useRef, useMemo, useTransition } from 'react';
import { MessageView } from '@/components/message-view';
import { MessageForm } from '@/components/message-form';
import { Button } from '@/components/ui/button';
import { Copy, Check, LogOut, Clock, MoreVertical, Trash2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Link from 'next/link';
import { Logo } from './logo';
import { CountdownTimer } from './countdown-timer';
import { TypingIndicator } from './typing-indicator';
import { joinRoomAndAddUserAction, deleteRoomAction } from '@/app/actions';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
} from "@/components/ui/alert-dialog";
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';


const adjectives = [
  'Agile', 'Brave', 'Clever', 'Daring', 'Eager', 'Fierce', 'Gentle', 'Happy', 'Jolly', 'Keen', 'Lazy', 'Mighty',
  'Nimble', 'Proud', 'Quiet', 'Swift', 'Tricky', 'Vast', 'Witty', 'Zany'
];

const nouns = [
  'Ape', 'Bear', 'Cat', 'Dog', 'Eagle', 'Fox', 'Goat', 'Hawk', 'Ibex', 'Jaguar', 'Koala', 'Lion', 'Mole',
  'Nightingale', 'Ocelot', 'Panda', 'Quail', 'Rabbit', 'Snake', 'Tiger', 'Vulture', 'Walrus', 'Yak', 'Zebra',
  'Dragon', 'Gryphon', 'Hydra', 'Phoenix', 'Unicorn', 'Basilisk', 'Centaur', 'Fairy', 'Gnome', 'Harpy',
  'Imp', 'Jinn', 'Kelpie', 'Leprechaun', 'Mermaid', 'Nymph', 'Orc', 'Pegasus', 'Roc', 'Satyr', 'Troll', 'Vampire',
  'Werewolf', 'Yeti'
];

const generateAnonymousName = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

const getAvatarUrl = (name: string) => `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${encodeURIComponent(name)}`;

function AdminRoomActions({ roomCode, adminName }: { roomCode: string, adminName: string }) {
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const formData = new FormData();
      formData.append('roomCode', roomCode);
      formData.append('adminName', adminName);
      await deleteRoomAction(formData);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-2 bg-secondary/50 rounded-lg transition-colors hover:bg-secondary px-3 py-2 h-auto">
          <span className="hidden md:inline text-primary">Options</span>
          <MoreVertical className="w-4 h-4 md:ml-2 text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/" className="flex items-center cursor-pointer">
            <LogOut className="w-4 h-4 mr-2" />
            Leave Room
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Room
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the room and all of its messages.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/80">
                {isDeleting ? 'Deleting...' : 'Delete Room'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ChatRoom({ initialRoom }: { initialRoom: Room }) {
  const [room, setRoom] = useState<Room>(initialRoom);
  const [userName, setUserName] = useState<string>('');
  const [userAvatarUrl, setUserAvatarUrl] = useState<string>('');
  const [hasJoined, setHasJoined] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const isRedirecting = useRef(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const router = useRouter();

  const lastMessageId = room.messages.length > 0 ? room.messages[room.messages.length - 1].id : null;
  const isAdmin = room.admin === userName;

  useEffect(() => {
    let name = sessionStorage.getItem(`codeyapp-user-${initialRoom.code}`);
    if (!name) {
      name = generateAnonymousName();
      sessionStorage.setItem(`codeyapp-user-${initialRoom.code}`, name);
    }
    const avatarUrl = getAvatarUrl(name);

    const joinAndSetUser = async () => {
      setUserName(name!);
      setUserAvatarUrl(avatarUrl);

      const formData = new FormData();
      formData.append('roomCode', initialRoom.code);
      formData.append('userName', name!);
      formData.append('userAvatarUrl', avatarUrl);
      await joinRoomAndAddUserAction(formData);
      setHasJoined(true);
    };

    joinAndSetUser();

  }, [initialRoom.code]);

  // Real-time listener using Firestore onSnapshot
  useEffect(() => {
    // Only start listening after user has fully joined the room
    if (!userName || !hasJoined) return;

    // Skip if already redirecting away
    if (isRedirecting.current) return;

    const roomRef = doc(db, 'rooms', initialRoom.code);

    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      // Prevent multiple redirects/toasts
      if (isRedirecting.current) return;

      // For deletion checks, only trust server data (not cached)
      const isFromServer = !snapshot.metadata.fromCache;

      if (!snapshot.exists()) {
        // Room may be deleted - only act on server-confirmed deletion
        if (isFromServer) {
          isRedirecting.current = true;
          toast({
            title: "Room Deleted",
            description: "This room has been deleted by the admin."
          });
          setTimeout(() => router.replace('/'), 2000);
        }
        // If from cache and doesn't exist, just wait for server confirmation
        return;
      }

      const data = snapshot.data();

      // Check if room was marked as deleted (only trust server data)
      if (data.deleted && isFromServer) {
        isRedirecting.current = true;
        toast({
          title: "Room Deleted",
          description: "This room has been deleted by the admin."
        });
        setTimeout(() => router.replace('/'), 2000);
        return;
      }

      // Check if room has expired (only trust server data for expiry)
      if (isFromServer) {
        const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt);
        if (expiresAt < new Date()) {
          isRedirecting.current = true;
          toast({
            title: "Room Expired",
            description: "This room has expired and been deleted."
          });
          setTimeout(() => router.replace('/'), 2000);
          return;
        }
      }

      const updatedRoom: Room = {
        code: data.code,
        createdAt: data.createdAt,
        isPrivate: data.isPrivate || false,
        password: data.password,
        admin: data.admin,
        messages: data.messages || [],
        users: (data.users || []).sort((a: any, b: any) => a.joinedAt - b.joinedAt),
        typing: data.typing || {},
        kickedUsers: data.kickedUsers || [],
      };

      // Check if user was kicked (only trust server data for kick detection)
      if (isFromServer) {
        const amIStillInRoom = updatedRoom.users.some(u => u.name === userName);
        const wasIKicked = updatedRoom.kickedUsers?.includes(userName);

        if (!amIStillInRoom || wasIKicked) {
          isRedirecting.current = true;
          toast({
            variant: 'destructive',
            title: "You've been kicked",
            description: "You have been removed from the room by the admin."
          });
          setTimeout(() => router.replace('/'), 3000);
          return;
        }
      }

      setRoom(updatedRoom);
    }, (error) => {
      console.error('Firestore listener error:', error);
      // Only show connection error if not already redirecting
      if (!isRedirecting.current) {
        toast({
          variant: 'destructive',
          title: "Connection Error",
          description: "Lost connection to the room. Trying to reconnect..."
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [initialRoom.code, userName, hasJoined, router, toast]);

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
    <div className="flex flex-col h-svh bg-background overflow-x-hidden">
      <header className="flex items-center justify-between p-2 md:p-4 md:border-b">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/">
            <Logo variant="small" />
          </Link>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 cursor-pointer transition-colors hover:bg-secondary"
            onClick={handleCopyCode}
          >
            <span className="font-mono text-lg md:text-xl font-bold text-primary">
              {room.code}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary"
              aria-label="Copy room code"
            >
              {codeCopied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {isMobile ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="p-2 bg-secondary/50 rounded-lg transition-colors hover:bg-secondary px-3 py-2 h-auto text-primary">
                  <Clock className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <div className="flex items-center px-3 py-2 rounded-lg bg-secondary/50">
                  <CountdownTimer createdAt={room.createdAt} />
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <div className="flex items-center px-3 py-2 rounded-lg bg-secondary/50">
              <CountdownTimer createdAt={room.createdAt} />
            </div>
          )}

          {isAdmin && hasJoined ? (
            <AdminRoomActions roomCode={room.code} adminName={userName} />
          ) : (
            <Button variant="ghost" asChild className="p-2 bg-secondary/50 rounded-lg transition-colors hover:bg-secondary px-3 py-2 h-auto">
              <Link href="/">
                <span className="hidden md:inline text-primary">Leave Room</span>
                <LogOut className="w-4 h-4 md:ml-2 text-primary" />
              </Link>
            </Button>
          )}
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

      <footer className="p-2 sm:p-4 bg-background md:border-t">
        <div className="max-w-4xl mx-auto w-full">
          {userName ? (
            <MessageForm roomCode={room.code} userName={userName} userAvatarUrl={userAvatarUrl} room={room} />
          ) : (
            <p className="text-center text-muted-foreground">Joining room...</p>
          )}
        </div>
      </footer>
    </div>
  );
}
