
"use client";

import { useGuestStore } from "@/hooks/use-guest-store";
import { Header } from "@/components/header";
import { ReservationDialog } from "@/components/reservation-data-table/reservation-dialog";
import { DataTable } from "@/components/reservation-data-table/data-table";
import { columns } from "@/components/reservation-data-table/columns";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { Reservation } from "@/lib/types";
import { collection, query } from "firebase/firestore";
import { useMemo } from "react";

export default function ReservationsPage() {
  const { 
    openReservationDialog, 
    isReservationDialogOpen, 
    closeReservationDialog,
    editingReservation,
    openGuestDialog // for adding a walk-in guest from this page
  } = useGuestStore();
  const firestore = useFirestore();

  const reservationsQuery = useMemoFirebase(() => query(collection(firestore, 'reservations')), [firestore]);
  const { data: reservations, isLoading } = useCollection<Reservation>(reservationsQuery);

  const safeReservations = useMemo(() => reservations || [], [reservations]);


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header onAddNewGuest={openGuestDialog} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-headline text-4xl font-bold">Reservations</h1>
          <p className="text-muted-foreground">
            Manage your upcoming and past reservations.
          </p>
        </div>

        <DataTable columns={columns} data={safeReservations} onAddReservation={openReservationDialog} isLoading={isLoading}/>
      </main>
      <ReservationDialog
        key={editingReservation?.id || 'new-reservation'}
        open={isReservationDialogOpen}
        onOpenChange={(isOpen) => !isOpen && closeReservationDialog()}
        reservation={editingReservation}
      />
    </div>
  );
}
