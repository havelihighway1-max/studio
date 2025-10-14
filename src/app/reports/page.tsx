
"use client";

import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { format, isWithinInterval, isValid } from "date-fns";
import { Calendar as CalendarIcon, Printer } from "lucide-react";
import { collection, query, Timestamp } from 'firebase/firestore';

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
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";

const convertGuestTimestamps = (guests: (Omit<Guest, 'visitDate'> & { visitDate: Timestamp })[]): Guest[] => {
  return guests
    .filter(g => g.visitDate) // Filter out guests with no visitDate
    .map(g => ({
      ...g,
      visitDate: g.visitDate.toDate(),
    }));
};

export default function ReportsPage() {
  const { openGuestDialog, isGuestDialogOpen, closeGuestDialog } = useGuestStore();
  const firestore = useFirestore();
  
  const guestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'guests'));
  }, [firestore]);
  
  const { data: rawGuests, isLoading } = useCollection<(Omit<Guest, 'visitDate'> & { visitDate: Timestamp })>(guestsQuery);
  const allGuests = useMemo(() => (rawGuests ? convertGuestTimestamps(rawGuests) : []), [rawGuests]);

  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const safeGuests = useMemo(() => allGuests || [], [allGuests]);

  const filteredGuests = useMemo(() => {
    return safeGuests.filter((guest) => {
      if (!date?.from) return true; // If no start date, show all
      const toDate = date.to || date.from;
      const visitDate = guest.visitDate;
      if (!isValid(visitDate)) return false; // Skip invalid dates
      return isWithinInterval(visitDate, { start: date.from, end: toDate });
    });
  }, [safeGuests, date]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background print:bg-white">
      <Header onAddNewGuest={openGuestDialog} />
      <main className="flex-1 p-4 md:p-6 lg:p-8 print:p-0">
        <div className="mb-8 print:hidden">
          <h1 className="font-headline text-4xl font-bold">Guest Reports</h1>
          <p className="text-muted-foreground">
            Analyze your guest data by selecting a date range. All guests are shown by default.
          </p>
        </div>

        <div className="mb-8 flex items-center gap-4 print:hidden">
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
                  <span>Pick a date range</span>
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
           <Button onClick={() => window.print()} variant="outline" className="ml-auto">
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
        </div>

        <div className="print:block" id="print-area">
          <div className="mb-4 hidden print:block">
            <h1 className="font-headline text-2xl font-bold">Guest Report</h1>
            <p className="text-sm">
                Date Range: {date?.from ? format(date.from, "LLL dd, y") : 'All Time'} - {date?.to ? format(date.to, "LLL dd, y") : ''}
            </p>
             <p className="text-sm">
                Total Guests in Report: <strong>{filteredGuests.length}</strong>
            </p>
          </div>
          <DataTable columns={columns} data={filteredGuests} isLoading={isLoading} />
        </div>
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
