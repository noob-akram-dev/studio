
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Github, Linkedin, Code, ShieldCheck, Timer, Twitter } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const JoinCreateForms = dynamic(() => import('@/components/join-create-forms').then(mod => mod.JoinCreateForms), {
    ssr: false,
    loading: () => <div className="max-w-4xl w-full text-center h-[370px]">Loading forms...</div>
});

// Based on https://web.dev/patterns/pwa/install-pwa
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string,
  }>;
  prompt(): Promise<void>;
}

export function HomePage() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const beforeInstallPromptHandler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installEvent) {
      return;
    }
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') {
      setInstallEvent(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 flex flex-col items-center p-4 sm:p-8 overflow-x-hidden">
        <div className="text-center mb-10 sm:mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-in-out">
            <div className="inline-block p-4 rounded-full transition-shadow duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/20">
             <Logo className="justify-center" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mt-4">
              Private Chat for Everyone.
            </h1>
            <p className="text-muted-foreground mt-4 text-md sm:text-lg max-w-2xl mx-auto">
              Grab a secure, temporary chat room perfect for sharing code, spilling secrets, or plotting on your opps "off the record" without leaving a trail of awkward screenshots. Think of it as incognito mode for conversations.
            </p>
             {installEvent && (
              <div className="mt-8 flex justify-center">
                <Button onClick={handleInstallClick} variant="outline" size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Install App
                </Button>
              </div>
            )}
        </div>
        
        <Suspense fallback={<div className="max-w-4xl w-full text-center">Loading forms...</div>}>
            <JoinCreateForms />
        </Suspense>
        
         <section className="w-full max-w-4xl mx-auto mt-24 text-center">
          <h2 className="text-3xl font-bold mb-8">Secure, Swift, and Simple</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 bg-card/50 border-border/50 border rounded-lg shadow-md hover:shadow-2xl hover:shadow-primary/20 transition-all hover:border-primary/30">
              <Code className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Developer Focused</h3>
              <p className="text-muted-foreground">
                Built for coding discussions with syntax highlighting and easy code sharing. Perfect for pair programming, interviews, or quick debugging sessions.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card/50 border-border/50 border rounded-lg shadow-md hover:shadow-2xl hover:shadow-primary/20 transition-all hover:border-primary/30">
              <ShieldCheck className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your conversations are your own. Use password-protected private rooms. We never store your data long-term.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card/50 border-border/50 border rounded-lg shadow-md hover:shadow-2xl hover:shadow-primary/20 transition-all hover:border-primary/30">
               <Timer className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ephemeral by Design</h3>
              <p className="text-muted-foreground">
                All chat rooms and their content are automatically and permanently deleted after 2 hours. Your conversations disappear, for good.
              </p>
            </div>
          </div>
        </section>

      </main>
      <footer className="w-full p-4 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">Connect with me</p>
            <div className="flex items-center gap-2">
              <Link href="https://www.linkedin.com/in/akramshakil/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5 text-muted-foreground transition-colors duration-300 ease-in-out hover:text-primary" />
              </Link>
              <Link href="https://github.com/shaikhakramshakil" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github className="h-5 w-5 text-muted-foreground transition-colors duration-300 ease-in-out hover:text-primary" />
              </Link>
              <Link href="https://x.com/akram_speakss" target="_blank" rel="noopener noreferrer" aria-label="X">
                <Twitter className="h-5 w-5 text-muted-foreground transition-colors duration-300 ease-in-out hover:text-primary" />
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
             <Link href="/blog" className="text-sm text-muted-foreground transition-colors duration-300 ease-in-out hover:text-primary">
              Blog
            </Link>
             <Link href="/terms" className="text-sm text-muted-foreground transition-colors duration-300 ease-in-out hover:text-primary">
              Terms and Conditions
            </Link>
             <Link href="/faq" className="text-sm text-muted-foreground transition-colors duration-300 ease-in-out hover:text-primary">
              FAQ
            </Link>
             <Link href="/privacy" className="text-sm text-muted-foreground transition-colors duration-300 ease-in-out hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/sitemap.xml" className="text-sm text-muted-foreground transition-colors duration-300 ease-in-out hover:text-primary">
              Sitemap
            </Link>
            {installEvent && (
              <button onClick={handleInstallClick} className="text-sm text-muted-foreground transition-colors duration-300 ease-in-out hover:text-primary">
                Install App
              </button>
            )}
          </div>
        </div>
      </footer>
         <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Code Yapp",
            "applicationCategory": "DeveloperTool",
            "operatingSystem": "WEB",
            "description": "A private and ephemeral chat application for developers to share and discuss code snippets in secure, temporary chat rooms.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
             "featureList": [
                "Ephemeral Chat Rooms",
                "Password-Protected Private Rooms",
                "Syntax Highlighting",
                "Anonymous Usernames",
                "No Registration Required",
                "Automatic Data Deletion"
            ],
            "author": {
                "@type": "Person",
                "name": "Akram Shakil"
            }
          })}}
        />
    </div>
  );
}
