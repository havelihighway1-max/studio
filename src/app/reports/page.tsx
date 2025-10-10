
"use client";

import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { addDays, format, isWithinInterval } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { collection, query } from 'firebase/firestore';

import { useGuestStore } from "@/hooks/use-guest-store";
import { Guest } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DataTable } from "@/components/guest-data-table/data-table";
import { columns } from "@/components/guest-data-table/columns";
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";
import { GuestDialog } from "@/components/guest-data-table/guest-dialog";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";

export default function ReportsPage() {
  const { openGuestDialog, isGuestDialogOpen, closeGuestDialog } = useGuestStore();
  const firestore = useFirestore();
  const { user } = useUser();
  
  const guestsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'guests'));
  }, [firestore, user]);
  
  const { data: allGuests, isLoading } = useCollection<Guest>(guestsQuery);

  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const safeGuests = useMemo(() => allGuests || [], [allGuests]);

  const filteredGuests = safeGuests.filter((guest) => {
    if (!date?.from) return true; // If no start date, show all
    const toDate = date.to || date.from;
    const visitDate = new Date(guest.visitDate); // Convert Firestore timestamp
    return isWithinInterval(visitDate, { start: date.from, end: toDate });
  });

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header onAddNewGuest={openGuestDialog} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-headline text-4xl font-bold">Guest Reports</h1>
          <p className="text-muted-foreground">
            Analyze your guest data by selecting a date range.
          </p>
        </div>

        <div className="mb-8 flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <p className="text-muted-foreground">
            Showing <strong>{filteredGuests.length}</strong> of <strong>{safeGuests.length}</strong> guests.
          </p>
        </div>

        <DataTable columns={columns} data={filteredGuests} isLoading={isLoading} />
      </main>
      <GuestDialog
        key={useGuestStore.getState().editingGuest?.id || 'new-report'}
        open={isGuestDialogOpen}
        onOpenChange={(isOpen) => !isOpen && closeGuestDialog()}
        guest={useGuestStore.getState().editingGuest}
      />
    </div>
  );
}
