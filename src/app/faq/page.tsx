
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Code Yapp',
  description: 'Frequently Asked Questions about Code Yapp. Learn about our private, ephemeral chat rooms, security, and data policies.',
  alternates: {
    canonical: '/faq',
  },
};

const faqData = [
  {
    question: "What is Code Yapp?",
    answer: "Code Yapp is a free, web-based chat service that provides temporary, private chat rooms. It's designed for anyone who needs a quick and secure way to have a conversation without creating an account or leaving a permanent record."
  },
  {
    question: "Is it really private? What data do you store?",
    answer: "Yes. We take privacy seriously. All chat content is stored temporarily to enable the chat and is automatically deleted after 2 hours. We don't require sign-ups, and we don't link your IP address to your conversations. Usernames are generated randomly and are only associated with a specific chat room."
  },
  {
    question: "How long do chat rooms last?",
    answer: "Every chat room and its entire contents are automatically and permanently deleted 2 hours after creation. Once a room expires, the data is gone for good."
  },
  {
    question: "Do I need to create an account?",
    answer: "No. Code Yapp is designed to be anonymous and frictionless. You can join or create a room instantly without any registration."
  },
  {
    question: "What is the difference between a public and a private room?",
    answer: "A public room can be joined by anyone with the 4-digit room code. A private room requires both the room code and a password, offering an extra layer of security for your conversations."
  },
  {
    question: "Is there a limit to the number of users in a room?",
    answer: "There is no hard limit on the number of users, but for the best experience, rooms are ideal for small to medium-sized groups."
  },
  {
    question: "What kind of information should I avoid sharing?",
    answer: "While we take security seriously, we advise against sharing highly sensitive, permanent credentials like your primary passwords or secret keys. The service is secure, but it's always good practice to be cautious with your most critical data."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground">
            Have a question? We've got answers.
          </p>
        </header>

        <Accordion type="single" collapsible className="w-full">
          {faqData.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg text-left hover:no-underline">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="mt-16 text-center">
            <Button asChild>
                <Link href="/">Return to Home</Link>
            </Button>
        </div>
      </div>
       <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqData.map(item => ({
                  "@type": "Question",
                  "name": item.question,
                  "acceptedAnswer": {
                      "@type": "Answer",
                      "text": item.answer
                  }
              }))
          })}}
        />
    </div>
  );
}
