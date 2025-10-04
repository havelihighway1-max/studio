'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing guest feedback.
 *
 * - summarizeGuestFeedback - A function that takes in guest feedback and returns a summary of common themes and areas for improvement.
 * - SummarizeGuestFeedbackInput - The input type for the summarizeGuestFeedback function.
 * - SummarizeGuestFeedbackOutput - The return type for the summarizeGuestFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeGuestFeedbackInputSchema = z.object({
  feedback: z.array(z.string()).describe('An array of guest feedback strings.'),
});
export type SummarizeGuestFeedbackInput = z.infer<typeof SummarizeGuestFeedbackInputSchema>;

const SummarizeGuestFeedbackOutputSchema = z.object({
  summary: z.string().describe('A summary of the common themes and areas for improvement based on the guest feedback.'),
});
export type SummarizeGuestFeedbackOutput = z.infer<typeof SummarizeGuestFeedbackOutputSchema>;

export async function summarizeGuestFeedback(input: SummarizeGuestFeedbackInput): Promise<SummarizeGuestFeedbackOutput> {
  return summarizeGuestFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeGuestFeedbackPrompt',
  input: {schema: SummarizeGuestFeedbackInputSchema},
  output: {schema: SummarizeGuestFeedbackOutputSchema},
  prompt: `You are a restaurant manager tasked with summarizing guest feedback to identify common themes and areas for improvement.

  Here is the guest feedback:
  {{#each feedback}}
  - {{{this}}}
  {{/each}}

  Please provide a concise summary of the common themes and areas for improvement, highlighting key issues and suggestions for the restaurant to address. Focus on actionable insights that can be used to enhance the guest experience.
  Output should be no more than 3 sentences.
  `,
});

const summarizeGuestFeedbackFlow = ai.defineFlow(
  {
    name: 'summarizeGuestFeedbackFlow',
    inputSchema: SummarizeGuestFeedbackInputSchema,
    outputSchema: SummarizeGuestFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
