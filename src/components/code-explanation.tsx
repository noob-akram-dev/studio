
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Lightbulb } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Card, CardContent } from './ui/card';

export function CodeExplanation({ explanation }: { explanation: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 text-primary">
          <Lightbulb className="w-4 h-4" />
          <span>{isOpen ? 'Hide' : 'Explain Code'}</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-2 border-primary/20 bg-primary/10">
            <CardContent className="p-3 text-sm text-primary/90">
                 {explanation}
            </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
