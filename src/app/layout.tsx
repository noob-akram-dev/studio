
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

const siteConfig = {
  name: 'Code Yapp',
  url: 'https://code-yapp.com', // Replace with your actual domain
  description: 'Get a secure, temporary chat room for any private discussion. Ideal for developers sharing code and for anyone who needs to talk "off the record." Your conversations disappear, so you can collaborate with complete confidence.',
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
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet"></link>
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap" rel="stylesheet"></link>
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
