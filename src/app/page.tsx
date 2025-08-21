
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
import { Download, Terminal, Github, Linkedin, Lock, Key } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Based on https://web.dev/patterns/pwa/install-pwa
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}

function HomeComponent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const code = searchParams.get('code');
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
            <div className="inline-block p-4 rounded-full transition-shadow duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/20">
             <Logo className="justify-center" />
          </div>
          <p className="text-muted-foreground mt-2 text-md sm:text-lg">
            Yapp about your code. Code about your yapp.
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

        {error && (
            <Alert variant="destructive" className="mb-8 max-w-md">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {error === 'not_found' && 'The room code you entered was not found. Please check the code or create a new room.'}
                    {error === 'password_too_short' && 'Password must be at least 4 characters long.'}
                    {error === 'invalid_password' && `Invalid password for room ${code}. Please try again.`}
                </AlertDescription>
            </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl">
          <Card className="w-full bg-card shadow-md transition-shadow duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/20">
            <CardHeader>
              <CardTitle>Create a Room</CardTitle>
              <CardDescription>
                Start a new session and get a unique room code to share.
              </CardDescription>
            </CardHeader>
            <form action={createRoomAction}>
              <CardContent>
                <Tabs defaultValue="public" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="public">Public</TabsTrigger>
                    <TabsTrigger value="private"><Lock className="mr-2 h-4 w-4" />Private</TabsTrigger>
                  </TabsList>
                  <TabsContent value="public" className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Anyone with the room code can join.
                    </p>
                    <input type="hidden" name="private" value="false" />
                  </TabsContent>
                  <TabsContent value="private" className="pt-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Only people with the password can join this room.
                    </p>
                    <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            name="password"
                            type="password"
                            placeholder="Enter a password (min 4 chars)"
                            minLength={4}
                            required
                            className="pl-10"
                        />
                    </div>
                    <input type="hidden" name="private" value="true" />
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    variant="default"
                  >
                    Create Room
                  </Button>
              </CardFooter>
            </form>
          </Card>

          <Card className="w-full bg-card shadow-md transition-shadow duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/20">
            <CardHeader>
              <CardTitle>Join an Existing Room</CardTitle>
              <CardDescription>
                Enter a room code and password if required.
              </CardDescription>
            </CardHeader>
            <form action={joinRoomAction} className="w-full">
              <CardContent className="space-y-4">
                <div title="Please enter a 4-digit code">
                  <Input
                    name="code"
                    placeholder="e.g. 1234"
                    maxLength={4}
                    required
                    pattern="\d{4}"
                    className="text-center text-lg tracking-widest"
                    defaultValue={code ?? ''}
                  />
                </div>
                 <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        name="password"
                        type="password"
                        placeholder="Enter password (if required)"
                        className="pl-10"
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
              <Linkedin className="h-5 w-5 text-muted-foreground transition-colors duration-300 ease-in-out hover:text-primary" />
            </Link>
            <Link href="https://github.com/shaikhakramshakil" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5 text-muted-foreground transition-colors duration-300 ease-in-out hover:text-primary" />
            </Link>
            <Separator orientation="vertical" className="h-5" />
             <Link href="/terms" className="text-sm text-muted-foreground transition-colors duration-300 ease-in-out hover:text-primary">
              Terms of Service
            </Link>
            <Separator orientation="vertical" className="h-5" />
             <Link href="/privacy" className="text-sm text-muted-foreground transition-colors duration-300 ease-in-out hover:text-primary">
              Privacy Policy
            </Link>
            {installEvent && (
              <>
                <Separator orientation="vertical" className="h-5" />
                <button onClick={handleInstallClick} className="text-sm text-muted-foreground transition-colors duration-300 ease-in-out hover:text-primary">
                  Install App
                </button>
              </>
            )}
          </div>
        </footer>
    </div>
  );
}


export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeComponent />
    </Suspense>
  );
}
