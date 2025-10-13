
"use server";

import { summarizeGuestData } from "@/ai/flows/summarize-guest-feedback";
import { Guest } from "@/lib/types";
import { Timestamp } from "firebase/firestore";

type GuestWithTimestamp = Omit<Guest, 'visitDate'> & { visitDate: Timestamp | Date };

export async function summarizeGuestDataAction(guests: GuestWithTimestamp[]) {
  if (guests.length === 0) {
    return { success: true, summary: "There is no guest data to analyze yet." };
  }

  // The flow expects date as a string, not a Date or Timestamp object.
  const serializableGuests = guests.map(g => {
    let visitDateStr: string;
    if (g.visitDate instanceof Timestamp) {
      visitDateStr = g.visitDate.toDate().toISOString();
    } else if (g.visitDate instanceof Date) {
      visitDateStr = g.visitDate.toISOString();
    } else {
      visitDateStr = new Date(g.visitDate).toISOString();
    }
    
    return {
      ...g,
      visitDate: visitDateStr,
    };
  });

  try {
    const result = await summarizeGuestData({ guests: serializableGuests });
    return { success: true, summary: result.summary };
  } catch (error) {
    console.error("Error summarizing feedback:", error);
    return { success: false, error: "Failed to generate insights. Please try again." };
  }
}
