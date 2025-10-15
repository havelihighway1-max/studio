
import { Reservation } from "@/lib/types";
import { collection, getDocs, query, Timestamp } from "firebase/firestore";
import { getDb } from "@/firebase/config";
import { Header } from "@/components/header";
import { ReservationsClientContent } from "@/components/reservations-client-content";

// Helper function to safely convert Firestore Timestamps to Dates
const convertReservationTimestamps = (reservations: (Omit<Reservation, 'dateOfEvent'> & { dateOfEvent: Timestamp })[]): Reservation[] => {
  return reservations
    .filter(r => r.dateOfEvent)
    .map(r => ({
      ...r,
      dateOfEvent: r.dateOfEvent.toDate(),
    }));
};

async function getReservations() {
  const db = getDb();
  let reservations: Reservation[] = [];

  try {
    const reservationsQuery = query(collection(db, 'reservations'));
    const reservationsSnapshot = await getDocs(reservationsQuery);
    const rawReservations = reservationsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as (Omit<Reservation, 'dateOfEvent'> & { dateOfEvent: Timestamp })[];
    reservations = convertReservationTimestamps(rawReservations);
  } catch (e) {
      console.error("Could not fetch reservations data. This might be due to Firestore API not being enabled.", e);
  }
  
  return reservations;
}


export default async function ReservationsPage() {
  const reservations = await getReservations();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <ReservationsClientContent initialReservations={reservations} />
    </div>
  );
}
