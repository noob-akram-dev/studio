
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
import { Terminal, Lock, Key } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


export function JoinCreateForms() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const code = searchParams.get('code');

   return (
    <>
     {error && (
            <Alert variant="destructive" className="mb-8 max-w-md w-full mx-auto">
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
          <div className="animate-in fade-in slide-in-from-left-12 duration-1000 ease-in-out">
            <Card className="w-full bg-card/50 border-border/50 shadow-md transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/30">
              <CardHeader>
                <CardTitle>Create a Room</CardTitle>
                <CardDescription>
                  Start a new, private session and get a unique room code to share.
                </CardDescription>
              </CardHeader>
              <form action={createRoomAction}>
                <CardContent>
                  <Tabs defaultValue="public" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
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
                              className="pl-10 bg-background/70 border-border/70"
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
          </div>

          <div className="animate-in fade-in slide-in-from-right-12 duration-1000 ease-in-out">
            <Card className="w-full bg-card/50 border-border/50 shadow-md transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/30">
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
                      className="text-center text-lg tracking-widest bg-background/70 border-border/70"
                      defaultValue={code ?? ''}
                    />
                  </div>
                   <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                          name="password"
                          type="password"
                          placeholder="Enter password (if required)"
                          className="pl-10 bg-background/70 border-border/70"
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
        </div>
    </>
  );
}
