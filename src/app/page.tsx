
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
import { Logo } from '@/components/logo';

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const error = searchParams?.error;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="text-center mb-12">
        <Logo className="justify-center" />
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
            <form action={createRoomAction} className="w-full">
              <Button
                type="submit"
                className="w-full"
                variant="default"
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
          <form action={joinRoomAction} className="w-full">
            <CardContent>
              <Input
                name="code"
                placeholder="e.g. 1234"
                maxLength={4}
                required
                pattern="\d{4}"
                title="Please enter a 4-digit code"
                className="text-center text-lg tracking-widest"
              />
            </CardContent>
            <CardFooter>
             <Button
                type="submit"
                className="w-full"
                variant="secondary"
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
