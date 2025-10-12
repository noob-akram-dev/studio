
'use client';

import type { Message } from '@/lib/types';
import { useState, useEffect } from 'react';
import { formatRelative } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Copy, Check, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CodeBlock } from './code-block';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { CodeExplanation } from './code-explanation';
import Image from 'next/image';

export function MessageView({
  message,
  currentUser,
}: {
  message: Message;
  currentUser: string;
}) {
  const [copied, setCopied] = useState(false);
  const [formattedTimestamp, setFormattedTimestamp] = useState<string | null>(null);
  const isCurrentUser = message.user.name === currentUser;

  useEffect(() => {
    // This now runs only on the client, preventing any server-client mismatch on initial render.
    setFormattedTimestamp(formatRelative(new Date(message.timestamp), new Date()));
  }, [message.timestamp]);


  const handleCopy = () => {
    if (message.text) {
        navigator.clipboard.writeText(message.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const parts = message.text.split(/(```[\s\S]*?```)/g);

  const hasCodeBlock = message.text.includes('```');

  return (
    <div
      className={cn(
        'flex items-start gap-2 sm:gap-3 transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-bottom-4',
        isCurrentUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
        <AvatarImage src={message.user.avatarUrl} alt={message.user.name} />
        <AvatarFallback>{message.user.name.substring(0, 2)}</AvatarFallback>
      </Avatar>
      <div className={cn('flex flex-col gap-1 w-full max-w-[80%] sm:max-w-[85%]', isCurrentUser ? 'items-end' : 'items-start')}>
        <div className="flex items-center gap-2">
           <span className="text-xs font-medium text-primary truncate">
             {isCurrentUser ? 'You' : message.user.name}
           </span>
           <span className="text-xs text-muted-foreground whitespace-nowrap">
             {formattedTimestamp || 'sending...'}
           </span>
         </div>

        <Card
          className={cn(
            'rounded-2xl p-0 shadow-sm group/message',
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-br-none'
              : 'bg-accent text-accent-foreground rounded-bl-none'
          )}
        >
          <CardContent className="p-3 whitespace-pre-wrap font-body text-sm break-words">
             {message.fileUrl && (
              <div className="mb-2">
                {message.fileType?.startsWith('image/') ? (
                   <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Image 
                      src={message.fileUrl} 
                      alt={message.fileName || 'Attached Image'} 
                      width={300}
                      height={200}
                      className="rounded-md object-cover max-w-full h-auto cursor-pointer"
                    />
                  </a>
                ) : (
                  <a 
                    href={message.fileUrl} 
                    download={message.fileName}
                    className="flex items-center gap-2 p-2 rounded-md bg-black/20 hover:bg-black/30"
                  >
                    <FileText className="w-6 h-6" />
                    <span className="truncate flex-1">{message.fileName || 'Download file'}</span>
                    <Download className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
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
             {message.explanation && (
                <CodeExplanation explanation={message.explanation} />
            )}
          </CardContent>
        </Card>
      </div>
      {message.text && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 opacity-0 group-hover/message:opacity-50 hover:!opacity-100"
          onClick={handleCopy}
          aria-label="Copy message text"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
