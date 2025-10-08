
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History, Cake, Calendar as CalendarIcon, GlassWater } from "lucide-react";
import { Guest, Reservation } from "@/lib/types";
import { format } from "date-fns";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

interface AnniversaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: (Guest | Reservation)[];
}

export function AnniversaryDialog({ open, onOpenChange, events }: AnniversaryDialogProps) {
  
  const isGuest = (event: Guest | Reservation): event is Guest => 'visitDate' in event;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            This Day in History
          </DialogTitle>
          <DialogDescription>
            A look back at guests and reservations from this day in previous years.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 py-4">
            {events.length > 0 ? (
              events.map((event) => {
                const eventDate = isGuest(event) ? event.visitDate : event.dateOfEvent;
                const reservation = !isGuest(event) ? (event as Reservation) : null;
                return (
                  <div key={event.id} className="p-4 rounded-lg border bg-card/50 flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                       {reservation?.occasion === 'birthday' ? <Cake className="h-5 w-5 text-primary" /> : reservation ? <CalendarIcon className="h-5 w-5 text-primary" /> : <GlassWater className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">{event.name}</p>
                        {reservation?.occasion && (
                          <Badge variant="secondary" className="capitalize">{reservation.occasion}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isGuest(event) ? "Visited on" : "Reservation on"} {format(eventDate, "MMMM d, yyyy")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Party of {event.numberOfGuests}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-center text-muted-foreground py-8">
                No anniversaries or past events for today.
              </p>
            )}
          </div>
        </ScrollArea>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
