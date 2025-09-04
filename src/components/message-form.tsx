
'use client';

import { useEffect, useRef, useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { sendMessageAction, userTypingAction, kickUserAction } from '@/app/actions';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Send, Loader2, Users, ShieldBan, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedCallback } from 'use-debounce';
import type { Room } from '@/lib/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="icon" variant="ghost" aria-label="Send message" className="group text-primary">
      {pending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Send className="transition-transform group-hover:scale-110 group-hover:translate-x-0.5" />
      )}
    </Button>
  );
}

function KickUserButton({ roomCode, adminName, userToKickName }: { roomCode: string, adminName: string, userToKickName: string }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleKick = () => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append('roomCode', roomCode);
            formData.append('adminName', adminName);
            formData.append('userToKickName', userToKickName);
            const result = await kickUserAction(formData);

            if (result?.error) {
                toast({
                    variant: 'destructive',
                    title: 'Error kicking user',
                    description: result.error,
                });
            } else {
                 toast({
                    title: 'User Kicked',
                    description: `${userToKickName} has been removed from the room.`,
                });
            }
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                    <ShieldBan className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to kick {userToKickName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will permanently remove the user from the room. They will not be able to rejoin.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleKick} disabled={isPending} className="bg-destructive hover:bg-destructive/80">
                         {isPending ? <Loader2 className="animate-spin" /> : 'Kick User'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function MessageForm({
  roomCode,
  userName,
  userAvatarUrl,
  room,
}: {
  roomCode: string;
  userName:string;
  userAvatarUrl: string;
  room: Room;
}) {
  const [state, formAction] = useActionState(sendMessageAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const isAdmin = room.admin === userName;
  
  const debouncedTypingAction = useDebouncedCallback(() => {
    const formData = new FormData();
    formData.append('roomCode', roomCode);
    formData.append('userName', userName);
    userTypingAction(formData);
  }, 500, { leading: true, trailing: false });

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <div className="flex items-center gap-2 rounded-lg p-1 sm:p-2 border border-border bg-card">
        <form
        ref={formRef}
        action={formAction}
        className="flex-1 flex items-center gap-2"
        onChange={debouncedTypingAction}
        >
        <input type="hidden" name="roomCode" value={roomCode} />
        <input type="hidden" name="userName" value={userName} />
        <input type="hidden" name="userAvatarUrl" value={userAvatarUrl} />
        <Textarea
            name="message"
            required
            className="flex-1 resize-none bg-transparent border-0 ring-0 focus-visible:ring-0 focus:ring-0 focus-visible:ring-offset-0"
            rows={1}
            onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                formRef.current?.requestSubmit();
            }
            }}
        />
        <SubmitButton />
        </form>
         <Popover>
            <PopoverTrigger asChild>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pr-2 cursor-pointer hover:text-primary transition-colors">
                    <Users className="w-4 h-4" />
                    <span>{room.users.length}</span>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-64">
                <div className="space-y-4">
                    <h4 className="font-medium leading-none text-center">Active Users</h4>
                     {room.users.length > 0 ? (
                        <ul className="space-y-2">
                        {room.users.map(user => (
                            <li key={user.name} className="flex items-center gap-2">
                                <Avatar className="h-6 w-6 text-xs">
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">{user.name}</span>
                                {user.name === room.admin && (
                                    <Crown className="w-4 h-4 text-yellow-500" title="Room Admin" />
                                )}
                                {isAdmin && user.name !== userName && (
                                    <KickUserButton 
                                        roomCode={roomCode}
                                        adminName={userName}
                                        userToKickName={user.name}
                                    />
                                )}
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No one else is here.</p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    </div>
  );
}
