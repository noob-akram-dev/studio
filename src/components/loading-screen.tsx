
'use client';

import { Loader2 } from "lucide-react";

export function LoadingScreen({ text }: { text: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground animate-pulse">{text}</p>
    </div>
  );
}
