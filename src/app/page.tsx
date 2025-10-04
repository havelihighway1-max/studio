"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { useGuestStore } from "@/hooks/use-guest-store";
import { GuestDialog } from "@/components/guest-data-table/guest-dialog";
import {
  isSameDay,
  isThisMonth,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, UserPlus, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const guests = useGuestStore((state) => state.guests);
  const { isGuestDialogOpen, closeGuestDialog, openGuestDialog } = useGuestStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalGuests = guests.length;
  const newToday = guests.filter((g) => isSameDay(g.visitDate, new Date())).length;
  const newThisMonth = guests.filter((g) => isThisMonth(g.visitDate)).length;
  
  const today = new Date();
  const lastWeekSameDay = new Date(today);
  lastWeekSameDay.setDate(today.getDate() - 7);
  const sameDayLastWeekCount = guests.filter((g) => isSameDay(g.visitDate, lastWeekSameDay)).length;


  if (!isClient) {
    // You can keep a skeleton loader here if you want
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header onAddNewGuest={() => openGuestDialog()} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-headline text-5xl font-bold">Welcome to <br/>Haveli Kebab & Grill</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
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
        </div>
        <div className="mt-8 text-center">
            <p className="text-lg text-muted-foreground">Your Restaurant. Smarter</p>
        </div>
      </main>

      <GuestDialog
        key={useGuestStore.getState().editingGuest?.id || 'new'}
        open={isGuestDialogOpen}
        onOpenChange={(isOpen) => !isOpen && closeGuestDialog()}
        guest={useGuestStore.getState().editingGuest}
      />
    </div>
  );
}
