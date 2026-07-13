
'use client';

import { useState, useEffect } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;

export function CountdownTimer({ createdAt }: { createdAt: number }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [hasExpired, setHasExpired] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expirationTime = createdAt + TWO_HOURS_IN_MS;
      const now = Date.now();
      const difference = expirationTime - now;

      if (difference <= 0) {
        setTimeLeft('00:00:00');
        setHasExpired(true);
        clearInterval(timer);
        return;
      }

      setIsUrgent(difference < 15 * 60 * 1000); // under 15 minutes

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
      const minutes = Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0');
      const seconds = Math.floor((difference / 1000) % 60).toString().padStart(2, '0');
      
      setTimeLeft(`${hours}:${minutes}:${seconds}`);
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // Initial calculation

    return () => clearInterval(timer);
  }, [createdAt]);

  if (hasExpired) {
    return (
       <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/15 text-destructive text-xs font-medium border border-destructive/20">
        <Timer className="w-3.5 h-3.5" />
        <span>Room Expired</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
        isUrgent
          ? "bg-amber-500/15 text-amber-500 border-amber-500/30 animate-pulse"
          : "bg-secondary/60 text-muted-foreground border-border/50"
      )}
      title="Time remaining until room and messages self-destruct"
    >
      {isUrgent ? (
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
      ) : (
        <Timer className="w-3.5 h-3.5 text-primary" />
      )}
      <span className="font-mono tracking-tight">{timeLeft}</span>
    </div>
  );
}

