
'use client';

import { useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { sendMessageAction, userTypingAction } from '@/app/actions';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Send, Loader2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedCallback } from 'use-debounce';


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
  activeUsers,
}: {
  roomCode: string;
  userName: string;
  activeUsers: number;
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
    <div className="flex items-start gap-2 rounded-lg p-1 sm:p-2 border border-border bg-card">
        <form
        ref={formRef}
        action={formAction}
        className="flex-1 flex items-start gap-2"
        onChange={debouncedTypingAction}
        >
        <input type="hidden" name="roomCode" value={roomCode} />
        <input type="hidden" name="userName" value={userName} />
        <Textarea
            name="message"
            placeholder="Type your message or code snippet here..."
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
         <div className="flex items-center gap-2 text-sm text-muted-foreground pr-2">
            <Users className="w-4 h-4" />
            <span>{activeUsers}</span>
        </div>
    </div>
  );
}
