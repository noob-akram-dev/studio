'use server';

/**
 * @fileOverview This file defines a Genkit flow to detect the programming language of a given code snippet.
 *
 * @exports detectProgrammingLanguage - An async function that takes code as input and returns the detected language.
 * @exports DetectProgrammingLanguageInput - The input type for the detectProgrammingLanguage function.
 * @exports DetectProgrammingLanguageOutput - The return type for the detectProgrammingLanguage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectProgrammingLanguageInputSchema = z.object({
  code: z.string().describe('The code snippet to analyze.'),
});

export type DetectProgrammingLanguageInput = z.infer<
  typeof DetectProgrammingLanguageInputSchema
>;

const DetectProgrammingLanguageOutputSchema = z.object({
  language: z
    .string()
    .describe('The detected programming language of the code snippet.'),
});

export type DetectProgrammingLanguageOutput = z.infer<
  typeof DetectProgrammingLanguageOutputSchema
>;

export async function detectProgrammingLanguage(
  input: DetectProgrammingLanguageInput
): Promise<DetectProgrammingLanguageOutput> {
  return detectProgrammingLanguageFlow(input);
}

const detectProgrammingLanguagePrompt = ai.definePrompt({
  name: 'detectProgrammingLanguagePrompt',
  input: {schema: DetectProgrammingLanguageInputSchema},
  output: {schema: DetectProgrammingLanguageOutputSchema},
  prompt: `You are a programming language expert. Your task is to identify the programming language of the given code snippet.

  Code Snippet:
  \`\`\`{{{code}}}\`\`\`

  Identify the programming language and respond ONLY with the name of the language. For example, if the code is in Javascript, you should respond with "Javascript". If you are unsure, respond with "Unknown".
  No other explanation is necessary.
  `,
});

const detectProgrammingLanguageFlow = ai.defineFlow(
  {
    name: 'detectProgrammingLanguageFlow',
    inputSchema: DetectProgrammingLanguageInputSchema,
    outputSchema: DetectProgrammingLanguageOutputSchema,
  },
  async input => {
    const {output} = await detectProgrammingLanguagePrompt(input);
    return output!;
  }
);
