
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-primary mb-6">Terms of Service</h1>
        
        <div className="space-y-6 text-muted-foreground">
          <p>Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-2xl font-semibold text-foreground pt-4">1. Agreement to Terms</h2>
          <p>
            By accessing or using our service, Code Yapp ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service.
          </p>

          <h2 className="text-2xl font-semibold text-foreground pt-4">2. Description of Service</h2>
          <p>
            Code Yapp provides a temporary, real-time chat service for sharing and discussing code snippets. Chat rooms and their entire contents are ephemeral and will be automatically and permanently deleted two (2) hours after their creation. We do not store your data beyond this period.
          </p>

          <h2 className="text-2xl font-semibold text-foreground pt-4">3. User Conduct and Responsibilities</h2>
          <p>
            You are solely responsible for the content you share through the Service. By using Code Yapp, you agree not to:
          </p>
          <ul className="list-disc list-inside pl-4 space-y-2">
            <li>Post, upload, or share any content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.</li>
            <li>Share any content that infringes on the intellectual property rights of others, including copyrights, patents, trademarks, or trade secrets.</li>
            <li>Transmit any malicious code, viruses, worms, or any other software intended to damage or alter a computer system or data.</li>
            <li>Attempt to gain unauthorized access to the Service, other users' accounts, or computer systems or networks connected to the Service.</li>
            <li>Harass, annoy, intimidate, or threaten any other users of the Service.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground pt-4">4. Disclaimer of Warranties</h2>
          <p>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, that the service will be uninterrupted, timely, secure, or error-free. You use the service at your own risk.
          </p>

          <h2 className="text-2xl font-semibold text-foreground pt-4">5. Limitation of Liability</h2>
          <p>
            In no event shall Code Yapp or its creators be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of data, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>

          <h2 className="text-2xl font-semibold text-foreground pt-4">6. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
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
