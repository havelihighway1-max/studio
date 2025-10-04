"use server";

import { summarizeGuestFeedback } from "@/ai/flows/summarize-guest-feedback";

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
