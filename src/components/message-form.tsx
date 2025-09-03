
'use client';

import { useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { sendMessageAction, userTypingAction, kickUserAction } from '@/app/actions';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Send, Loader2, Users, Crown, ShieldX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedCallback } from 'use-debounce';
import type { Room } from '@/lib/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


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

export function MessageForm({
  roomCode,
  userName,
  userAvatarUrl,
  users,
  isAdmin,
  roomAdminName
}: {
  roomCode: string;
  userName: string;
  userAvatarUrl: string;
  users: Room['users'];
  isAdmin: boolean;
  roomAdminName?: string;
}) {
  const [state, formAction] = useActionState(sendMessageAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  
  const debouncedTypingAction = useDebouncedCallback(() => {
    const formData = new FormData();
    formData.append('roomCode', roomCode);
    formData.append('userName', userName);
    userTypingAction(formData);
  }, 500, { leading: true, trailing: false });

  const handleKickUser = (userNameToKick: string) => {
    const formData = new FormData();
    formData.append('roomCode', roomCode);
    formData.append('adminName', userName);
    formData.append('userNameToKick', userNameToKick);
    kickUserAction(formData);
  }

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
                    <span>{users.length}</span>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-64">
                <div className="space-y-4">
                    <h4 className="font-medium leading-none">Active Users</h4>
                     {users.length > 0 ? (
                        <ul className="space-y-2">
                        {users.map(user => (
                            <li key={user.name} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6 text-xs">
                                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                                        <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-muted-foreground">{user.name}</span>
                                    {user.name === roomAdminName && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Crown className="h-4 w-4 text-yellow-500" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Room Admin</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                                {isAdmin && user.name !== userName && (
                                     <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                 <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleKickUser(user.name)}>
                                                    <ShieldX className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Kick {user.name}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
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
