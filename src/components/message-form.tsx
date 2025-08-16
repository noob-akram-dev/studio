'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { sendMessageAction } from '@/app/actions';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="icon" aria-label="Send message">
      {pending ? <Loader2 className="animate-spin" /> : <Send />}
    </Button>
  );
}

export function MessageForm({
  roomCode,
  userName,
}: {
  roomCode: string;
  userName: string;
}) {
  const [state, formAction] = useFormState(sendMessageAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

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
    <form
      ref={formRef}
      action={formAction}
      className="flex items-start gap-4"
    >
      <input type="hidden" name="roomCode" value={roomCode} />
      <input type="hidden" name="userName" value={userName} />
      <Textarea
        name="message"
        placeholder="Type your message or code snippet here... Use ``` for code blocks."
        required
        className="flex-1 resize-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            formRef.current?.requestSubmit();
          }
        }}
      />
      <SubmitButton />
    </form>
  );
}
