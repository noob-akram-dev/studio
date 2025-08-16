'use client';

import type { Message } from '@/lib/types';
import { useState } from 'react';
import { formatRelative } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CodeBlock } from './code-block';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function MessageView({
  message,
  currentUser,
}: {
  message: Message;
  currentUser: string;
}) {
  const [copied, setCopied] = useState(false);
  const isCurrentUser = message.user.name === currentUser;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple regex to find ```code``` blocks
  const parts = message.text.split(/(```[\s\S]*?```)/g);

  return (
    <div
      className={cn(
        'flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300',
        isCurrentUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Avatar>
         <AvatarFallback>{message.user.name.substring(0, 2)}</AvatarFallback>
      </Avatar>
      <Card
        className={cn(
          'max-w-xl w-full',
          isCurrentUser ? 'bg-secondary' : 'bg-card'
        )}
      >
        <CardHeader className="flex flex-row justify-between items-center p-3">
          <CardTitle
            className={cn(
              'text-sm font-semibold',
              isCurrentUser ? 'text-primary' : 'text-accent-foreground'
            )}
          >
            {isCurrentUser ? 'You' : message.user.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {formatRelative(new Date(message.timestamp), new Date())}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopy}
              aria-label="Copy message text"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 whitespace-pre-wrap font-body text-sm">
          {parts.map((part, i) => {
            if (part.startsWith('```') && part.endsWith('```')) {
              const codeMatch = part.match(/```(\w*)\n?([\s\S]*)```/);
              if (codeMatch) {
                const language = codeMatch[1] || message.language || 'text';
                const code = codeMatch[2];
                return <CodeBlock key={i} language={language} code={code} />;
              }
            }
            return <span key={i}>{part}</span>;
          })}
        </CardContent>
      </Card>
    </div>
  );
}
