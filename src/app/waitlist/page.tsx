
import { WaitingGuest } from "@/lib/types";
import { collection, getDocs, query, Timestamp } from "firebase/firestore";
import { getDb } from "@/firebase/config";
import { Header } from "@/components/header";
import { WaitlistClientContent } from "@/components/waitlist-client-content";

const convertWaitingGuestTimestamps = (guests: (Omit<WaitingGuest, 'createdAt'> & { createdAt: Timestamp })[]): WaitingGuest[] => {
  return guests
    .filter(g => g.createdAt)
    .map(g => ({
      ...g,
      createdAt: g.createdAt.toDate(),
    }));
};

async function getWaitingGuests() {
  'use server';
  const db = getDb();
  let waitingGuests: WaitingGuest[] = [];

  try {
    const waitingGuestsQuery = query(collection(db, 'waitingGuests'));
    const waitingGuestsSnapshot = await getDocs(waitingGuestsQuery);
    const rawGuests = waitingGuestsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as (Omit<WaitingGuest, 'createdAt'> & { createdAt: Timestamp })[];
    waitingGuests = convertWaitingGuestTimestamps(rawGuests);
  } catch (e) {
      console.error("Could not fetch waiting guests data. This might be due to Firestore API not being enabled.", e);
  }

  return waitingGuests;
}

export default async function WaitlistPage() {
  const waitingGuests = await getWaitingGuests();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <WaitlistClientContent initialWaitingGuests={waitingGuests} />
    </div>
  );
}
