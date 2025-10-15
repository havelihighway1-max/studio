
import { Guest } from "@/lib/types";
import { collection, getDocs, query, Timestamp } from "firebase/firestore";
import { getDb } from "@/firebase/config";
import { Header } from "@/components/header";
import { ReportsClientContent } from "@/components/reports-client-content";

// Helper function to safely convert Firestore Timestamps to Dates
const convertGuestTimestamps = (guests: (Omit<Guest, 'visitDate'> & { visitDate: Timestamp })[]): Guest[] => {
  return guests
    .filter(g => g.visitDate)
    .map(g => ({
      ...g,
      visitDate: g.visitDate.toDate(),
    }));
};

async function getGuests() {
  'use server';
  const db = getDb();
  let guests: Guest[] = [];

  try {
      const guestsQuery = query(collection(db, 'guests'));
      const guestsSnapshot = await getDocs(guestsQuery);
      const rawGuests = guestsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as (Omit<Guest, 'visitDate'> & { visitDate: Timestamp })[];
      guests = convertGuestTimestamps(rawGuests);
  } catch (e) {
      console.error("Could not fetch guests data. This might be due to Firestore API not being enabled.", e);
      // Return empty array on error
  }
  return guests;
}

export default async function ReportsPage() {
  const guests = await getGuests();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background print:bg-white">
        <Header />
        <ReportsClientContent allGuests={guests} />
    </div>
  );
}
