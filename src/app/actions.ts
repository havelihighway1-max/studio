
"use server";

import { summarizeGuestData } from "@/ai/flows/summarize-guest-feedback";
import { Guest } from "@/lib/types";

export async function summarizeGuestDataAction(guests: Guest[]) {
  if (guests.length === 0) {
    return { success: true, summary: "There is no guest data to analyze yet." };
  }

  // The flow expects date as a string, not a Date object.
  const serializableGuests = guests.map(g => ({
    ...g,
    visitDate: g.visitDate.toISOString(),
  }));

  try {
    const result = await summarizeGuestData({ guests: serializableGuests });
    return { success: true, summary: result.summary };
  } catch (error) {
    console.error("Error summarizing feedback:", error);
    return { success: false, error: "Failed to generate insights. Please try again." };
  }
}
