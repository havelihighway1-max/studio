
"use server";

import { summarizeGuestFeedback } from "@/ai/flows/summarize-guest-feedback";
import { interpretVoiceCommand as interpretVoiceCommandFlow } from "@/ai/flows/interpret-voice-command";

export async function summarizeGuestFeedbackAction(feedback: string[]) {
  if (feedback.length === 0) {
    return { success: true, summary: "There is no feedback to analyze yet." };
  }

  try {
    const result = await summarizeGuestFeedback({ feedback });
    return { success: true, summary: result.summary };
  } catch (error) {
    console.error("Error summarizing feedback:", error);
    return { success: false, error: "Failed to generate insights. Please try again." };
  }
}


export async function interpretVoiceCommand(audioDataUri: string) {
  try {
    const result = await interpretVoiceCommandFlow({ audioDataUri });
    return result;
  } catch (error) {
    console.error("Error interpreting voice command:", error);
    // Rethrow or return a structured error
    throw new Error("Failed to process voice command in the backend.");
  }
}
