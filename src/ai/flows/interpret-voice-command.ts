
'use server';
/**
 * @fileOverview This file defines a Genkit flow for interpreting voice commands.
 *
 * - interpretVoiceCommand - A function that takes audio data and returns a structured command.
 * - InterpretVoiceCommandInput - The input type for the interpretVoiceCommand function.
 * - InterpretVoiceCommandOutput - The return type for the interpretVoiceCommand function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InterpretVoiceCommandInputSchema = z.object({
  audioDataUri: z.string().describe(
    "A chunk of audio as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:audio/webm;base64,<encoded_data>'."
  ),
});
export type InterpretVoiceCommandInput = z.infer<typeof InterpretVoiceCommandInputSchema>;

const InterpretVoiceCommandOutputSchema = z.object({
  command: z.string().describe(
    'The identified command. Possible values: "navigate", "add_guest", "add_reservation", "add_to_waitlist", "add_table", "unknown".'
  ),
  args: z.any().describe('An object containing the arguments for the command.'),
  transcription: z.string().describe('The transcribed text from the audio.'),
});
export type InterpretVoiceCommandOutput = z.infer<typeof InterpretVoiceCommandOutputSchema>;

export async function interpretVoiceCommand(input: InterpretVoiceCommandInput): Promise<InterpretVoiceCommandOutput> {
  return interpretVoiceCommandFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interpretVoiceCommandPrompt',
  input: { schema: z.object({ transcription: z.string() }) },
  output: { schema: InterpretVoiceCommandOutputSchema.omit({transcription: true}) },
  prompt: `You are a voice command interpreter for a restaurant management application.
Your task is to parse the user's transcribed speech and convert it into a structured command.

The available commands are:
- "navigate": To go to a specific page. The 'page' argument can be '/reports', '/reservations', '/tables', or '/waitlist'.
- "add_guest": To add a new walk-in guest. It requires 'name' (string) and 'numberOfGuests' (number).
- "add_reservation": To create a new reservation. It requires 'name' (string), 'numberOfGuests' (number), and optionally 'dateOfEvent' (ISO 8601 string).
- "add_to_waitlist": To add a guest to the waiting list. It requires 'name' (string) and 'numberOfGuests' (number).
- "add_table": To add a new table. It requires 'name' (string) and 'capacity' (number).
- "unknown": If the command cannot be determined.

Analyze the following transcription and determine the command and its arguments.
Today's date is ${new Date().toISOString()}.

Transcription: "{{{transcription}}}"

If a date or time is mentioned, convert it to a full ISO 8601 format. For example, "tomorrow at 7pm" should be converted to the correct date and time.
If no command can be clearly identified, set the command to "unknown".
Provide the output in the specified JSON format.
`,
});

const interpretVoiceCommandFlow = ai.defineFlow(
  {
    name: 'interpretVoiceCommandFlow',
    inputSchema: InterpretVoiceCommandInputSchema,
    outputSchema: InterpretVoiceCommandOutputSchema,
  },
  async (input) => {
    // 1. Speech-to-Text
    const { text: transcription } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview', // Using a multimodal model for STT
      prompt: [{ media: { url: input.audioDataUri } }],
    });

    if (!transcription) {
      return {
        command: 'unknown',
        args: {},
        transcription: '',
      };
    }

    // 2. Text-to-Command (NLU)
    const { output } = await prompt({ transcription });
    
    if (!output) {
      return {
        command: 'unknown',
        args: {},
        transcription,
      };
    }

    return {
      command: output.command,
      args: output.args,
      transcription: transcription,
    };
  }
);
