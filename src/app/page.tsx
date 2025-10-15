
import { Header } from "@/components/header";
import { Guest, Reservation, WaitingGuest } from "@/lib/types";
import { collection, getDocs, query, Timestamp, where } from "firebase/firestore";
import { getDb } from "@/firebase/config";
import { DashboardClientContent } from "@/components/dashboard-client-content";


// Helper function to safely convert Firestore Timestamps to Dates
const convertGuestTimestamps = (guests: (Omit<Guest, 'visitDate'> & { visitDate: Timestamp })[]): Guest[] => {
  return guests
    .filter(g => g.visitDate)
    .map(g => ({
      ...g,
      visitDate: g.visitDate.toDate(),
    }));
};

const convertReservationTimestamps = (reservations: (Omit<Reservation, 'dateOfEvent'> & { dateOfEvent: Timestamp })[]): Reservation[] => {
  return reservations
    .filter(r => r.dateOfEvent)
    .map(r => ({
      ...r,
      dateOfEvent: r.dateOfEvent.toDate(),
    }));
};

async function getDashboardData() {
  const db = getDb();
  let guests: Guest[] = [];
  let reservations: Reservation[] = [];
  let waitingGuests: WaitingGuest[] = [];

  try {
      const currentYearStart = new Date(new Date().getFullYear(), 0, 1);

      // Guests
      const guestsQuery = query(collection(db, 'guests'), where('visitDate', '>=', currentYearStart));
      const guestsSnapshot = await getDocs(guestsQuery);
      const rawGuests = guestsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as (Omit<Guest, 'visitDate'> & { visitDate: Timestamp })[];
      guests = convertGuestTimestamps(rawGuests);

      // Reservations
      const reservationsQuery = query(collection(db, 'reservations'), where('dateOfEvent', '>=', currentYearStart));
      const reservationsSnapshot = await getDocs(reservationsQuery);
      const rawReservations = reservationsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as (Omit<Reservation, 'dateOfEvent'> & { dateOfEvent: Timestamp })[];
      reservations = convertReservationTimestamps(rawReservations);
      
      // Waiting Guests
      const waitingGuestsQuery = query(collection(db, 'waitingGuests'), where('status', '==', 'waiting'));
      const waitingGuestsSnapshot = await getDocs(waitingGuestsQuery);
      waitingGuests = waitingGuestsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as WaitingGuest[];
  } catch (e) {
      console.error("Could not fetch dashboard data. This might be due to Firestore API not being enabled.", e);
      // Return empty arrays on error
  }


  return { guests, reservations, waitingGuests };
}


export default async function DashboardPage() {
  const { guests, reservations, waitingGuests } = await getDashboardData();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <DashboardClientContent guests={guests} reservations={reservations} waitingGuests={waitingGuests} />
    </div>
  );
}
