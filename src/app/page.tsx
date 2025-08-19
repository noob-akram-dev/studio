
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
import { Download, Terminal, Github, Linkedin } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

// Based on https://web.dev/patterns/pwa/install-pwa
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const error = searchParams?.error;
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const beforeInstallPromptHandler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installEvent) {
      return;
    }
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') {
      setInstallEvent(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-x-hidden">
        <div className="text-center mb-10 sm:mb-12">
          <Logo className="justify-center" />
          <p className="text-muted-foreground mt-2 text-md sm:text-lg">
            Yapp about your code. Code about your yap.
          </p>
        </div>

        {installEvent && (
          <div className="mb-8 max-w-md w-full flex justify-center">
            <Button onClick={handleInstallClick} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Install App
            </Button>
          </div>
        )}

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl">
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
                <div title="Please enter a 4-digit code">
                  <Input
                    name="code"
                    placeholder="e.g. 1234"
                    maxLength={4}
                    required
                    pattern="\d{4}"
                    className="text-center text-lg tracking-widest"
                  />
                </div>
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
      <footer className="w-full p-4 border-t border-border">
          <div className="max-w-4xl mx-auto flex items-center justify-center space-x-4">
            <p className="text-sm text-muted-foreground">Connect with me</p>
            <Link href="https://www.linkedin.com/in/akramshakil/" target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
            <Link href="https://github.com/shaikhakramshakil" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
            <Separator orientation="vertical" className="h-5" />
             <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Separator orientation="vertical" className="h-5" />
             <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            {installEvent && (
              <>
                <Separator orientation="vertical" className="h-5" />
                <button onClick={handleInstallClick} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Install App
                </button>
              </>
            )}
          </div>
        </footer>
    </div>
  );
}
