
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Header } from "@/components/header";
import { useGuestStore } from "@/hooks/use-guest-store";
import { GuestDialog } from "@/components/guest-data-table/guest-dialog";
import { InsightsDialog } from "@/components/guest-data-table/insights-dialog";
import {
  isSameDay,
  isThisMonth,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, UserPlus, CalendarCheck, MessageSquare, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { AnniversaryDialog } from "@/components/anniversary-dialog";
import { Guest, Reservation } from "@/lib/types";


export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const { guests, reservations, isGuestDialogOpen, closeGuestDialog, openGuestDialog, isInsightsDialogOpen, closeInsightsDialog } = useGuestStore();

  const [isAnniversaryDialogOpen, setIsAnniversaryDialogOpen] = useState(false);
  const [anniversaryEvents, setAnniversaryEvents] = useState<(Guest | Reservation)[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentDay = today.getDate();

      const anniversaryGuests = guests.filter(guest => {
        const visitDate = new Date(guest.visitDate);
        return visitDate.getMonth() === currentMonth &&
               visitDate.getDate() === currentDay &&
               visitDate.getFullYear() < today.getFullYear();
      });

      const anniversaryReservations = reservations.filter(reservation => {
        const eventDate = new Date(reservation.dateOfEvent);
        return eventDate.getMonth() === currentMonth &&
               eventDate.getDate() === currentDay &&
               eventDate.getFullYear() < today.getFullYear();
      });

      setAnniversaryEvents([...anniversaryGuests, ...anniversaryReservations]);
    }
  }, [isClient, guests, reservations]);


  const totalGuests = guests.reduce((sum, guest) => sum + (Number(guest.numberOfGuests) || 0), 0);
  const newToday = guests.filter((g) => isSameDay(g.visitDate, new Date())).reduce((sum, guest) => sum + (Number(guest.numberOfGuests) || 0), 0);
  const newThisMonth = guests.filter((g) => isThisMonth(g.visitDate)).reduce((sum, guest) => sum + (Number(guest.numberOfGuests) || 0), 0);
  
  const today = new Date();
  const lastWeekSameDay = new Date(today);
  lastWeekSameDay.setDate(today.getDate() - 7);
  const sameDayLastWeekCount = guests.filter((g) => isSameDay(g.visitDate, lastWeekSameDay)).reduce((sum, guest) => sum + (Number(guest.numberOfGuests) || 0), 0);

  const handleWhatsAppBroadcast = () => {
    if (typeof window !== 'undefined' && !navigator.onLine) {
        alert("This feature requires an internet connection.");
        return;
    }
    const todaysGuests = guests.filter(g => isSameDay(g.visitDate, new Date()));
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


  if (!isClient) {
    // You can keep a skeleton loader here if you want
    return null;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background">
       <div className="relative z-10 flex min-h-screen w-full flex-col">
          <Header onAddNewGuest={() => openGuestDialog()} />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Guests
                    <span className="block text-xl text-accent-foreground">الحمد لله</span>
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalGuests}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    New Today
                    <span className="block text-xl text-accent-foreground">الحمد لله</span>
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{newToday}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    New This Month
                    <span className="block text-xl text-accent-foreground">الحمد لله</span>
                  </CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{newThisMonth}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Same Day Last Week
                    <span className="block text-xl text-accent-foreground">الحمد لله</span>
                  </CardTitle>
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sameDayLastWeekCount}</div>
                </CardContent>
              </Card>
               <Card
                className={anniversaryEvents.length > 0 ? "cursor-pointer hover:bg-card/80" : ""}
                onClick={() => anniversaryEvents.length > 0 && setIsAnniversaryDialogOpen(true)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    This Day in History
                    <span className="block text-xl text-accent-foreground">ما شاء الله</span>
                  </CardTitle>
                  <History className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{anniversaryEvents.length}</div>
                   <p className="text-xs text-muted-foreground">
                    {anniversaryEvents.length > 0 ? "Click to view anniversaries" : "No events from past years"}
                  </p>
                </CardContent>
              </Card>
            </div>
            
          </main>
          <div className="fixed bottom-4 right-4 z-20">
            <Button onClick={handleWhatsAppBroadcast} size="lg">
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
    </div>
  );
}
