
'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing guest data.
 *
 * - summarizeGuestFeedback - A function that takes in guest data and returns a summary of common themes and areas for improvement.
 * - SummarizeGuestDataInput - The input type for the summarizeGuestData function.
 * - SummarizeGuestDataOutput - The return type for the summarizeGuestData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// We only need a subset of guest data for the summary.
const guestSummaryDataSchema = z.object({
  name: z.string(),
  visitDate: z.string().describe("The date of the guest's visit in ISO 8601 format."),
  preferences: z.string().optional(),
  feedback: z.string().optional(),
});

const SummarizeGuestDataInputSchema = z.object({
  guests: z.array(guestSummaryDataSchema).describe('An array of guest summary objects.'),
});
export type SummarizeGuestDataInput = z.infer<typeof SummarizeGuestDataInputSchema>;

const SummarizeGuestDataOutputSchema = z.object({
  summary: z.string().describe('A date-wise summary of guest traffic, feedback, and preferences.'),
});
export type SummarizeGuestDataOutput = z.infer<typeof SummarizeGuestDataOutputSchema>;

export async function summarizeGuestData(input: SummarizeGuestDataInput): Promise<SummarizeGuestDataOutput> {
  return summarizeGuestDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeGuestDataPrompt',
  input: {schema: SummarizeGuestDataInputSchema},
  output: {schema: SummarizeGuestDataOutputSchema},
  prompt: `You are a restaurant manager tasked with analyzing guest data to identify trends and areas for improvement.

  Here is the raw guest data, including names, visit dates, preferences, and feedback:
  {{#each guests}}
  - Name: {{this.name}}
    - Visit Date: {{this.visitDate}}
    - Preferences: {{this.preferences}}
    - Feedback: {{this.feedback}}
  {{/each}}

  Please provide a concise, date-wise summary. Analyze guest traffic, common feedback themes, and any notable preferences. Focus on actionable insights that can be used to enhance the guest experience.
  Group your findings by date.
  Output should be a few sentences per day.
  `,
});

const summarizeGuestDataFlow = ai.defineFlow(
  {
    name: 'summarizeGuestDataFlow',
    inputSchema: SummarizeGuestDataInputSchema,
    outputSchema: SummarizeGuestDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
