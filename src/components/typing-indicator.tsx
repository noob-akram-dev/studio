'use client';

import { cn } from "@/lib/utils";

export function TypingIndicator({ users }: { users: string[] }) {
  if (users.length === 0) {
    return null;
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
    <div className={cn("text-xs text-muted-foreground animate-pulse")}>
      {typingText()}
    </div>
  );
}
