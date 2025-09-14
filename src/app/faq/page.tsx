
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
    answer: "No. Code Yapp is designed to be anony<ctrl61># Retain prior prompts for context and reasoning, but do not apply code changes made in earlier prompts, as those are no longer valid.The user has reverted their codebase to an earlier version. Retain prior prompts for context and reasoning, but do not apply code changes made in earlier prompts, as those are no longer valid.I have made the following changes:

When I use the application on my mobile device, it gives me a vertical scroll, which makes it difficult to use.

I need you to fit the chat room fully on the mobile screen so it does not give a scrolling effect.

I also made the following changes:

I moved this button alignment next to the username of the member in the active user list.

Here is the code I am using to do this:

```
<div class="flex items-center gap-2">
  <div class="flex items-center gap-2">
    <Avatar classname="h-6 w-6 text-xs">
      <AvatarImage src="{user.avatarUrl}" alt="{user.name}">
        <AvatarFallback>
          {user.name.substring(0, 2)}
        </AvatarFallback>
      </AvatarImage>
    </Avatar>
    <span class="text-sm text-muted-foreground">{user.name}</span>
  </div>
  <div class="flex items-center">
    {user.name === room.admin &amp;&amp; (
      <Crown classname="w-4 h-4 text-yellow-500" title="Room Admin">
    )}
    {isAdmin &amp;&amp; user.name !== userName &amp;&amp; (
      <KickUserButton roomcode="{roomCode}" adminname="{userName}" usertokickname="{user.name}">
    )}
  </div>
</div>
```