
'use client';

import { useEffect, useState } from "react";
import { useGuestStore } from "@/hooks/use-guest-store";
import { isSameDay, isThisMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, UserPlus, CalendarCheck, MessageSquare, History, WifiOff, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnniversaryDialog } from "@/components/anniversary-dialog";
import { Guest, Reservation, WaitingGuest } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GuestDialog } from "./guest-data-table/guest-dialog";
import { InsightsDialog } from "./guest-data-table/insights-dialog";

interface DashboardClientContentProps {
    guests: Guest[];
    reservations: Reservation[];
    waitingGuests: WaitingGuest[];
}

export function DashboardClientContent({ guests, reservations, waitingGuests }: DashboardClientContentProps) {
  const [isClient, setIsClient] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const { 
    isGuestDialogOpen, 
    closeGuestDialog, 
    editingGuest,
    isInsightsDialogOpen, 
    closeInsightsDialog 
  } = useGuestStore();
  
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

  const isLoading = !isClient;

  if (!isClient) {
    // You can return a skeleton loader here if you want
    return null;
  }

  return (
    <>
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
        
        <GuestDialog
            key={editingGuest?.id || 'new-dashboard-guest'}
            open={isGuestDialogOpen}
            onOpenChange={(isOpen) => !isOpen && closeGuestDialog()}
            guest={editingGuest}
        />
        <InsightsDialog 
            open={isInsightsDialogOpen} 
            onOpenChange={closeInsightsDialog} 
        />
        <AnniversaryDialog
            open={isAnniversaryDialogOpen}
            onOpenChange={setIsAnniversaryDialogOpen}
            events={anniversaryEvents}
        />
    </>
  );
}
