
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Source_Code_Pro } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-code-pro',
});


const siteConfig = {
  name: 'Code Yapp',
  url: 'https://code-yapp.com', // Replace with your actual domain
  description: 'Grab a secure, temporary chat room perfect for sharing code, spilling secrets, or plotting your snack heist "off the record" without leaving a trail of awkward screenshots. Think of it as incognito mode for conversations.',
  keywords: ['private chat', 'secure chat', 'ephemeral chat', 'temporary chat', 'anonymous chat', 'secure code sharing', 'developer chat', 'private discussion'],
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Private & Ephemeral Chat for Everyone`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: 'Akram Shakil', url: 'https://github.com/shaikhakramshakil' }],
  creator: 'Akram Shakil',
  
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/og-image.png`, // You need to create this image
        width: 1200,
        height: 630,
        alt: `Logo for ${siteConfig.name}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og-image.png`], // You need to create this image
    creator: '@yourtwitterhandle', // Replace with your Twitter handle
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", inter.variable, sourceCodePro.variable)} suppressHydrationWarning={true}>
      <head>
        <meta name="theme-color" content="#27272a" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4890339593414259"
     crossOrigin="anonymous"></script>
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
