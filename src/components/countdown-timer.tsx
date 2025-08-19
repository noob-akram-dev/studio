
'use client';

import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;

export function CountdownTimer({ createdAt }: { createdAt: number }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [hasExpired, setHasExpired] = useState(false);

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
       <div className="flex items-center gap-2 text-sm text-destructive">
        <Timer className="w-4 h-4" />
        <span>Room Expired</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Timer className="w-4 h-4" />
      <span className="font-mono">{timeLeft}</span>
    </div>
  );
}
