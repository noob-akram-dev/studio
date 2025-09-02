
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Code Yapp',
  description: 'Our privacy policy explains how we handle your data in our temporary chat service. Your privacy is important to us.',
    alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-primary mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <p>
            This Privacy Policy explains how Code Yapp ("we," "us," or "our") handles information in connection with our temporary chat service (the "Service"). Your privacy is important to us, and we are committed to being transparent about our data practices.
          </p>

          <h2 className="text-2xl font-semibold text-foreground pt-4">1. Information We Collect</h2>
          <p>
            Our service is designed to be ephemeral, meaning we collect and store very little information.
          </p>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li><strong>Chat Content:</strong> All messages, code snippets, and other content shared in a chat room are stored temporarily on our servers to enable the real-time chat functionality.</li>
            <li><strong>Usernames:</strong> The anonymous username you are assigned is stored with your messages to identify you within the chat room.</li>
            <li><strong>Server Logs:</strong> Like most web services, our servers may automatically log basic information for security, debugging, and operational purposes. This may include your IP address, browser type, and access times. This data is not linked to your chat content and is kept for a limited period.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground pt-4">2. How We Use Information</h2>
          <p>
            The information we collect is used solely to provide and maintain the Service. We do not use your chat content for any other purpose. We do not sell, trade, or otherwise transfer your information to outside parties.
          </p>
          
          <h2 className="text-2xl font-semibold text-foreground pt-4">3. Data Retention and Deletion</h2>
          <p>
            <strong>All chat rooms and their entire contents are automatically and permanently deleted two (2) hours after their creation.</strong> Once a room expires, all associated messages and data are irrecoverably erased from our active systems.
          </p>

          <h2 className="text-2xl font-semibold text-foreground pt-4">4. Data Security</h2>
          <p>
            We take reasonable measures to protect the information transmitted through our service. However, please be aware that communications are not end-to-end encrypted. We advise against sharing any sensitive or confidential information, such as passwords, API keys, or personal data, through the Service.
          </p>
          
          <h2 className="text-2xl font-semibold text-foreground pt-4">5. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </div>

        <div className="mt-12 text-center">
            <Button asChild>
                <Link href="/">Return to Home</Link>
            </Button>
        </div>
      </div>
    </div>
  );
}
