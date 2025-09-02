
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
    answer: "No. Code Yapp is designed to be anonymous and frictionless. You are assigned a random, anonymous username when you join a room. No sign-up is required."
  },
  {
    question: "Who is this for?",
    answer: "It's for everyone who values privacy. It's particularly useful for developers who need to discuss code or debug problems, for teams needing a quick 'off the record' channel, or for anyone wanting to have a private conversation that disappears."
  },
  {
    question: "Is it free to use?",
    answer: "Yes, Code Yapp is completely free to use."
  },
  {
    question: "Is my conversation encrypted?",
    answer: "Communications are protected by standard HTTPS encryption, just like most modern websites. However, the chats are not end-to-end encrypted. We advise against sharing highly sensitive information like passwords or private keys."
  }
];

export default function FAQPage() {
  const faqSchema = {
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
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-primary mb-6 text-center">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-center mb-12">
            Have questions? We've got answers. If you can't find what you're looking for, feel free to reach out.
        </p>

        <Accordion type="single" collapsible className="w-full">
          {faqData.map((item, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg text-left hover:no-underline">{item.question}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
            <Button asChild>
                <Link href="/">Return to Home</Link>
            </Button>
        </div>
      </div>
      <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
    </div>
  );
}
