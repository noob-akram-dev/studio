'use server';

/**
 * @fileOverview This file defines a Genkit flow to identify the programming language of a code snippet and provide an explanation.
 *
 * @exports explainAndIdentifyCode - An async function that takes code as input and returns the detected language and an explanation.
 * @exports ExplainAndIdentifyCodeInput - The input type for the function.
 * @exports ExplainAndIdentifyCodeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ExplainAndIdentifyCodeInputSchema = z.object({
  code: z.string().describe('The code snippet to analyze.'),
});

export type ExplainAndIdentifyCodeInput = z.infer<
  typeof ExplainAndIdentifyCodeInputSchema
>;

const ExplainAndIdentifyCodeOutputSchema = z.object({
  language: z
    .string()
    .describe('The detected programming language of the code snippet. Respond with "Unknown" if not sure.'),
  explanation: z
    .string()
    .describe('A concise, one-sentence explanation of what the code does.'),
});

export type ExplainAndIdentifyCodeOutput = z.infer<
  typeof ExplainAndIdentifyCodeOutputSchema
>;

export async function explainAndIdentifyCode(
  input: ExplainAndIdentifyCodeInput
): Promise<ExplainAndIdentifyCodeOutput> {
  return explainAndIdentifyCodeFlow(input);
}

const explainAndIdentifyCodePrompt = ai.definePrompt({
  name: 'explainAndIdentifyCodePrompt',
  input: {schema: ExplainAndIdentifyCodeInputSchema},
  output: {schema: ExplainAndIdentifyCodeOutputSchema},
  prompt: `You are an expert at analyzing code. Given the following code snippet, identify its programming language and provide a single-sentence explanation of what it does.

  Code Snippet:
  \`\`\`{{{code}}}\`\`\`

  Your response must be in the requested JSON format. The explanation should be concise and easy to understand. If you cannot determine the language, respond with "Unknown".
  `,
});

const explainAndIdentifyCodeFlow = ai.defineFlow(
  {
    name: 'explainAndIdentifyCodeFlow',
    inputSchema: ExplainAndIdentifyCodeInputSchema,
    outputSchema: ExplainAndIdentifyCodeOutputSchema,
  },
  async input => {
    const {output} = await explainAndIdentifyCodePrompt(input);
    return output!;
  }
);
