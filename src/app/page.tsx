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
import { useState, useEffect } from 'react';

function SetNameDialog({
  open,
  onOpenChange,
  onNameSet,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNameSet: (name: string) => void;
  children: React.ReactNode;
}) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSet(name.trim());
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [roomCodeToJoin, setRoomCodeToJoin] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('codeshare-user');
    if (storedUser) {
      setUserName(storedUser);
    }
  }, []);

  const handleNameSet = (name: string) => {
    localStorage.setItem('codeshare-user', name);
    setUserName(name);
    // Now that the name is set, proceed with the action
    if (isCreateModalOpen) {
      document.getElementById('create-room-form')?.requestSubmit();
      setIsCreateModalOpen(false);
    }
    if (isJoinModalOpen && roomCodeToJoin) {
       document.getElementById('join-room-form')?.requestSubmit();
      setIsJoinModalOpen(false);
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
            <form id="create-room-form" action={createRoomAction}>
              {userName && <input type="hidden" name="userName" value={userName} />}
              <SetNameDialog
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onNameSet={handleNameSet}
              >
                <Button
                  type={userName ? 'submit' : 'button'}
                  className="w-full"
                  onClick={() => {
                    if (!userName) {
                      setIsCreateModalOpen(true);
                    }
                  }}
                >
                  Create Room
                </Button>
              </SetNameDialog>
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
          <form id="join-room-form" action={joinRoomAction}>
            <CardContent>
              <Input
                name="code"
                placeholder="e.g. 1234"
                maxLength={4}
                required
                pattern="\d{4}"
                title="Please enter a 4-digit code"
                className="text-center text-lg tracking-widest"
                onChange={(e) => setRoomCodeToJoin(e.target.value)}
              />
            </CardContent>
            <CardFooter>
             {userName && <input type="hidden" name="userName" value={userName} />}
              <SetNameDialog
                open={isJoinModalOpen}
                onOpenChange={setIsJoinModalOpen}
                onNameSet={handleNameSet}
              >
                <Button
                  type={userName ? 'submit' : 'button'}
                  className="w-full"
                  variant="secondary"
                   onClick={() => {
                    if (!userName) {
                      setIsJoinModalOpen(true);
                    }
                  }}
                >
                  Join Room
                </Button>
              </SetNameDialog>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}