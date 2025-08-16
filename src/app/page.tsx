'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createRoomAction, joinRoomAction } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState, useEffect, useRef } from 'react';

function SetNameDialog({
  open,
  onOpenChange,
  onNameSet,
  children,
  action,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNameSet: (name: string, action: 'create' | 'join') => void;
  children: React.ReactNode;
  action: 'create' | 'join';
}) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSet(name.trim(), action);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Enter your name</DialogTitle>
            <DialogDescription>
              Please enter your name to continue. This will be displayed to
              others in the chat room.
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
            <Button type="submit">Continue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const error = searchParams?.error;
  const [userName, setUserName] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomCodeToJoin, setRoomCodeToJoin] = useState('');
  
  const createFormRef = useRef<HTMLFormElement>(null);
  const joinFormRef = useRef<HTMLFormElement>(null);
  const [actionToPerform, setActionToPerform] = useState<'create' | 'join'>('create');

  useEffect(() => {
    const storedUser = localStorage.getItem('codeshare-user');
    if (storedUser) {
      setUserName(storedUser);
    }
  }, []);

  const handleNameSet = (name: string, action: 'create' | 'join') => {
    localStorage.setItem('codeshare-user', name);
    setUserName(name);

    setTimeout(() => {
        if (action === 'create') {
            createFormRef.current?.submit();
        } else if (action === 'join') {
            joinFormRef.current?.submit();
        }
    }, 0);

    setIsModalOpen(false);
  };

  const handleCreateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (userName) {
        createFormRef.current?.submit();
    } else {
        setActionToPerform('create');
        setIsModalOpen(true);
    }
  };

  const handleJoinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (userName) {
        joinFormRef.current?.submit();
    } else {
        setActionToPerform('join');
        setIsModalOpen(true);
    }
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl font-bold text-primary">
          CodeShare
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Share and discuss code in real-time. No login required.
        </p>
      </div>

      {error === 'not_found' && (
        <Alert variant="destructive" className="mb-8 max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            The room code you entered was not found. Please check the code or
            create a new room.
          </AlertDescription>
        </Alert>
      )}

      <SetNameDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onNameSet={handleNameSet}
        action={actionToPerform}
      >
        <div />
      </SetNameDialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="w-full bg-card shadow-md">
          <CardHeader>
            <CardTitle>Create a New Room</CardTitle>
            <CardDescription>
              Start a new session and get a unique room code to share.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click the button below to generate a new, private room for you and
              your colleagues.
            </p>
          </CardContent>
          <CardFooter>
            <form ref={createFormRef} action={createRoomAction} className="w-full">
              {userName && <input type="hidden" name="userName" value={userName} />}
              <Button
                type="button"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleCreateClick}
              >
                Create Room
              </Button>
            </form>
          </CardFooter>
        </Card>

        <Card className="w-full bg-card shadow-md">
          <CardHeader>
            <CardTitle>Join an Existing Room</CardTitle>
            <CardDescription>
              Enter a 4-digit room code to join a session.
            </CardDescription>
          </CardHeader>
          <form ref={joinFormRef} action={joinRoomAction} className="w-full">
            <CardContent>
              <Input
                name="code"
                placeholder="e.g. 1234"
                maxLength={4}
                required
                pattern="\\d{4}"
                title="Please enter a 4-digit code"
                className="text-center text-lg tracking-widest"
                onChange={(e) => setRoomCodeToJoin(e.target.value)}
              />
            </CardContent>
            <CardFooter>
             {userName && <input type="hidden" name="userName" value={userName} />}
             <Button
                type="button"
                className="w-full"
                variant="secondary"
                onClick={handleJoinClick}
              >
                Join Room
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
