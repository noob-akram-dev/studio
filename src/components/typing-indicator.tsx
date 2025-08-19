
'use client';

import { cn } from "@/lib/utils";
import { MessageSquareText } from "lucide-react";

export function TypingIndicator({ users }: { users: string[] }) {
  if (users.length === 0) {
    return <div className="h-6" />;
  }

  const typingText = () => {
    if (users.length === 1) {
      return `${users[0]} is typing...`;
    }
    if (users.length === 2) {
      return `${users[0]} and ${users[1]} are typing...`;
    }
    return `${users.slice(0, 2).join(', ')} and others are typing...`;
  };

  return (
    <div className={cn("flex items-center gap-2 h-6 text-xs text-muted-foreground animate-pulse pl-12")}>
       <MessageSquareText className="w-4 h-4" />
      <span>{typingText()}</span>
    </div>
  );
}
