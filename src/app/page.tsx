
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/header";
import { useGuestStore } from "@/hooks/use-guest-store";
import { GuestDialog } from "@/components/guest-data-table/guest-dialog";
import { InsightsDialog } from "@/components/guest-data-table/insights-dialog";
import {
  isSameDay,
  isThisMonth,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, UserPlus, CalendarCheck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";


export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const { guests, isGuestDialogOpen, closeGuestDialog, openGuestDialog, isInsightsDialogOpen, closeInsightsDialog } = useGuestStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalGuests = guests.reduce((sum, guest) => sum + (Number(guest.numberOfGuests) || 0), 0);
  const newToday = guests.filter((g) => isSameDay(g.visitDate, new Date())).reduce((sum, guest) => sum + (Number(guest.numberOfGuests) || 0), 0);
  const newThisMonth = guests.filter((g) => isThisMonth(g.visitDate)).reduce((sum, guest) => sum + (Number(guest.numberOfGuests) || 0), 0);
  
  const today = new Date();
  const lastWeekSameDay = new Date(today);
  lastWeekSameDay.setDate(today.getDate() - 7);
  const sameDayLastWeekCount = guests.filter((g) => isSameDay(g.visitDate, lastWeekSameDay)).reduce((sum, guest) => sum + (Number(guest.numberOfGuests) || 0), 0);
  const backgroundImage = PlaceHolderImages.find(img => img.id === 'blurry-dishes');

  const handleWhatsAppBroadcast = () => {
    const phoneNumbers = guests
      .map(guest => guest.phone)
      .filter(phone => !!phone)
      .map(phone => phone.replace(/\D/g, '')) // Remove non-numeric characters
      .join(',');

    if (phoneNumbers) {
      // This will open WhatsApp with a pre-selected list of contacts.
      // The user still has to type the message and send it.
      // This functionality depends on the user having WhatsApp installed.
      // Broadcasting to a list of numbers directly is not supported by standard `whatsapp://` URLs.
      // We will open a chat with the first user and the user can then forward the message.
      const firstPhone = phoneNumbers.split(',')[0];
      const text = encodeURIComponent("Hello! Here is our latest update from Haveli Kebab & Grill.");
      const url = `https://wa.me/?text=${text}`;
      window.open(url, '_blank');

    } else {
      alert("No guest phone numbers available for a broadcast.");
    }
  };


  if (!isClient) {
    // You can keep a skeleton loader here if you want
    return null;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background">
      {backgroundImage && (
          <Image
            src={backgroundImage.imageUrl}
            alt={backgroundImage.description}
            fill
            className="object-cover object-center filter blur-sm brightness-50"
            data-ai-hint={backgroundImage.imageHint}
            priority
          />
        )}
       <div className="relative z-10 flex min-h-screen w-full flex-col bg-black/50">
          <Header onAddNewGuest={() => openGuestDialog()} />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mb-8">
              <h1 className="font-headline text-5xl font-bold">Welcome to</h1>
              <h2 className="font-body text-6xl font-bold text-primary mt-2">بسم الله الرحمن الرحيم</h2>
            </div>

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
                  <CardTitle className="text-sm font-medium">New Today</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{newToday}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{newThisMonth}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Same Day Last Week</CardTitle>
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sameDayLastWeekCount}</div>
                </CardContent>
              </Card>
               {/* This card is a placeholder for the 5th item */}
              <Card className="opacity-0 pointer-events-none md:col-span-2 lg:col-span-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium"></CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold"></div>
                  </CardContent>
              </Card>
            </div>
            
            <div className="mt-12 text-center">
              <Button onClick={handleWhatsAppBroadcast} size="lg">
                <MessageSquare className="mr-2 h-5 w-5" />
                WhatsApp Broadcast
              </Button>
              <p className="mt-4 text-lg text-muted-foreground">Your Restaurant. Smarter</p>
            </div>

          </main>
        </div>

      <GuestDialog
        key={useGuestStore.getState().editingGuest?.id || 'new'}
        open={isGuestDialogOpen}
        onOpenChange={(isOpen) => !isOpen && closeGuestDialog()}
        guest={useGuestStore.getState().editingGuest}
      />
      <InsightsDialog open={isInsightsDialogOpen} onOpenChange={closeInsightsDialog} />
    </div>
  );
}
