
"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import { useGuestStore } from "@/hooks/use-guest-store";
import { GuestDialog } from "@/components/guest-data-table/guest-dialog";
import { InsightsDialog } from "@/components/guest-data-table/insights-dialog";
import {
  isSameDay,
  isThisMonth,
  startOfYear,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, UserPlus, CalendarCheck, MessageSquare, History, WifiOff, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnniversaryDialog } from "@/components/anniversary-dialog";
import { Guest, Reservation, WaitingGuest } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, Timestamp, where } from "firebase/firestore";
import { DashboardLayout } from "@/components/dashboard-layout";

const convertGuestTimestamps = (guests: (Omit<Guest, 'visitDate'> & { visitDate: Timestamp })[]): Guest[] => {
  return guests
    .filter(g => g.visitDate) // Filter out guests with no visitDate
    .map(g => ({
      ...g,
      visitDate: g.visitDate.toDate(),
    }));
};

const convertReservationTimestamps = (reservations: (Omit<Reservation, 'dateOfEvent'> & { dateOfEvent: Timestamp })[]): Reservation[] => {
  return reservations
    .filter(r => r.dateOfEvent) // Filter out reservations with no dateOfEvent
    .map(r => ({
      ...r,
      dateOfEvent: r.dateOfEvent.toDate(),
    }));
};


export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const { isGuestDialogOpen, closeGuestDialog, isInsightsDialogOpen, closeInsightsDialog } = useGuestStore();
  const firestore = useFirestore();

  const currentYearStart = useMemo(() => startOfYear(new Date()), []);

  const guestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'guests'), where('visitDate', '>=', currentYearStart));
  }, [firestore, currentYearStart]);
  
  const reservationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'reservations'), where('dateOfEvent', '>=', currentYearStart));
  }, [firestore, currentYearStart]);

  const waitingGuestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'waitingGuests'), where('status', '==', 'waiting'));
  }, [firestore]);

  const { data: rawGuests, isLoading: guestsLoading } = useCollection<(Omit<Guest, 'visitDate'> & { visitDate: Timestamp })>(guestsQuery);
  const { data: rawReservations, isLoading: reservationsLoading } = useCollection<(Omit<Reservation, 'dateOfEvent'> & { dateOfEvent: Timestamp })>(reservationsQuery);
  const { data: waitingGuests, isLoading: waitingGuestsLoading } = useCollection<WaitingGuest>(waitingGuestsQuery);
  
  const guests = useMemo(() => (rawGuests ? convertGuestTimestamps(rawGuests) : []), [rawGuests]);
  const reservations = useMemo(() => (rawReservations ? convertReservationTimestamps(rawReservations) : []), [rawReservations]);

  const [isAnniversaryDialogOpen, setIsAnniversaryDialogOpen] = useState(false);
  const [anniversaryEvents, setAnniversaryEvents] = useState<(Guest | Reservation)[]>([]);
  
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
        setIsOffline(!navigator.onLine);
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }
  }, []);

  useEffect(() => {
    if (isClient && guests && reservations) {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentDay = today.getDate();

      const anniversaryGuests = guests.filter(guest => {
        if (!guest.visitDate) return false;
        const visitDate = new Date(guest.visitDate);
        return visitDate.getMonth() === currentMonth &&
               visitDate.getDate() === currentDay &&
               visitDate.getFullYear() < today.getFullYear();
      });

      const anniversaryReservations = reservations.filter(reservation => {
        if (!reservation.dateOfEvent) return false;
        const eventDate = new Date(reservation.dateOfEvent);
        return eventDate.getMonth() === currentMonth &&
               eventDate.getDate() === currentDay &&
               eventDate.getFullYear() < today.getFullYear();
      });

      setAnniversaryEvents([...anniversaryGuests, ...anniversaryReservations]);
    }
  }, [isClient, guests, reservations]);

  
  const totalGuests = guests.reduce((sum, guest) => sum + (Number(guest.numberOfGuests) || 0), 0);
  const newToday = guests.filter((g) => isSameDay(new Date(g.visitDate), new Date())).reduce((sum, guest) => sum + (Number(guest.numberOfGuests) || 0), 0);
  const newThisMonth = guests.filter((g) => isThisMonth(new Date(g.visitDate))).reduce((sum, guest) => sum + (Number(guest.numberOfGuests) || 0), 0);
  
  const today = new Date();
  const lastWeekSameDay = new Date(today);
  lastWeekSameDay.setDate(today.getDate() - 7);
  const sameDayLastWeekCount = guests.filter((g) => isSameDay(new Date(g.visitDate), lastWeekSameDay)).reduce((sum, guest) => sum + (Number(guest.numberOfGuests) || 0), 0);
  const totalWaiting = waitingGuests?.length || 0;

  const handleWhatsAppBroadcast = () => {
    if (isOffline) {
        alert("This feature requires an internet connection.");
        return;
    }
    const todaysGuests = guests.filter(g => isSameDay(new Date(g.visitDate), new Date()));
    const phoneNumbers = todaysGuests
      .map(guest => guest.phone)
      .filter(phone => !!phone)
      .map(phone => phone.replace(/\D/g, '')); // Remove non-numeric characters

    if (phoneNumbers.length > 0) {
      // The `wa.me` URL scheme does not support sending to a list.
      // The best we can do is pre-fill the text and let the user select the contacts.
      const text = encodeURIComponent("Good night and thank you for dining with us at HAVELI KEBAB & GRILL! We hope you enjoyed your meal and we look forward to seeing you again soon.");
      const url = `https://wa.me/?text=${text}`;
      window.open(url, '_blank');
    } else {
      alert("No guests with phone numbers were entered today.");
    }
  };

  const isLoading = guestsLoading || reservationsLoading || waitingGuestsLoading || !firestore;

  if (!isClient) {
    return null;
  }

  return (
    <DashboardLayout>
        <div className="flex min-h-screen w-full flex-col bg-background">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
              {isOffline && (
                  <Alert variant="destructive" className="mb-4">
                  <WifiOff className="h-4 w-4" />
                  <AlertTitle>You are offline</AlertTitle>
                  <AlertDescription>
                      Some features may be unavailable. Your data is being saved locally and will sync when you're back online.
                  </AlertDescription>
                  </Alert>
              )}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <Card className="border-primary bg-primary/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                      Total Guests
                      <span className="block text-xl text-primary/80">الحمد لله</span>
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? '...' : totalGuests}</div>
                  </CardContent>
              </Card>
              <Card className="border-secondary bg-secondary/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                      New Today
                      <span className="block text-xl text-secondary-foreground/80">الحمد لله</span>
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? '...' : `+${newToday}`}</div>
                  </CardContent>
              </Card>
              <Card className="border-accent bg-accent/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                      New This Month
                      <span className="block text-xl text-accent-foreground/80">الحمد لله</span>
                  </CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? '...' : `+${newThisMonth}`}</div>
                  </CardContent>
              </Card>
              <Card className="border-yellow-500 bg-yellow-500/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                      Total Waiting
                      <span className="block text-xl text-yellow-600/80 dark:text-yellow-500/80">إن شاء الله</span>
                  </CardTitle>
                  <Hourglass className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? '...' : totalWaiting}</div>
                  </CardContent>
              </Card>
              <Card className="border-blue-500 bg-blue-500/10">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                      Same Day Last Week
                      <span className="block text-xl text-blue-600/80 dark:text-blue-500/80">الحمد لله</span>
                  </CardTitle>
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? '...' : sameDayLastWeekCount}</div>
                  </CardContent>
              </Card>
              <Card
                  className={cn(
                  "border-pink-500 bg-pink-500/10",
                  anniversaryEvents.length > 0 && !isLoading ? "cursor-pointer hover:bg-pink-500/20" : ""
                  )}
                  onClick={() => anniversaryEvents.length > 0 && !isLoading && setIsAnniversaryDialogOpen(true)}
              >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-pink-700 dark:text-pink-400">
                      This Day in History
                      <span className="block text-xl text-pink-600/80 dark:text-pink-500/80">ما شاء الله</span>
                  </CardTitle>
                  <History className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                  <div className="text-2xl font-bold">{isLoading ? '...' : anniversaryEvents.length}</div>
                  <p className="text-xs text-muted-foreground">
                      {isLoading ? 'Loading...' : (anniversaryEvents.length > 0 ? "Click to view anniversaries" : "No events from past years")}
                  </p>
                  </CardContent>
              </Card>
              </div>
              
          </main>
          <div className="fixed bottom-4 right-4 z-20 print:hidden">
              <Button onClick={handleWhatsAppBroadcast} size="lg" disabled={isOffline}>
              <MessageSquare className="mr-2 h-5 w-5" />
              WhatsApp Broadcast
              </Button>
          </div>
        </div>

        <GuestDialog
            key={useGuestStore.getState().editingGuest?.id || 'new'}
            open={isGuestDialogOpen}
            onOpenChange={(isOpen) => !isOpen && closeGuestDialog()}
            guest={useGuestStore.getState().editingGuest}
        />
        <InsightsDialog open={isInsightsDialogOpen} onOpenChange={closeInsightsDialog} />
       <AnniversaryDialog
        open={isAnniversaryDialogOpen}
        onOpenChange={setIsAnniversaryDialogOpen}
        events={anniversaryEvents}
      />
    </DashboardLayout>
  );
}

    