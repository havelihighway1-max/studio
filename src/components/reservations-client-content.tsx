
'use client';

import { useGuestStore } from "@/hooks/use-guest-store";
import { ReservationDialog } from "@/components/reservation-data-table/reservation-dialog";
import { DataTable } from "@/components/reservation-data-table/data-table";
import { columns } from "@/components/reservation-data-table/columns";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { Reservation } from "@/lib/types";
import { collection, query } from "firebase/firestore";
import { useMemo } from "react";

interface ReservationsClientContentProps {
  initialReservations: Reservation[];
}

export function ReservationsClientContent({ initialReservations }: ReservationsClientContentProps) {
  const { 
    openReservationDialog, 
    isReservationDialogOpen, 
    closeReservationDialog,
    editingReservation,
  } = useGuestStore();
  const firestore = useFirestore();

  const reservationsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'reservations'));
  }, [firestore]);

  const { data: liveReservations, isLoading } = useCollection<Reservation>(reservationsQuery);

  const dataToShow = useMemo(() => liveReservations || initialReservations, [liveReservations, initialReservations]);

  return (
    <>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mb-8">
          <h1 className="font-headline text-4xl font-bold">Reservations</h1>
          <p className="text-muted-foreground">
              Manage your upcoming and past reservations.
          </p>
          </div>

          <DataTable columns={columns} data={dataToShow} onAddReservation={openReservationDialog} isLoading={isLoading && !liveReservations}/>
      </main>
      <ReservationDialog
          key={editingReservation?.id || 'new-reservation'}
          open={isReservationDialogOpen}
          onOpenChange={(isOpen) => !isOpen && closeReservationDialog()}
          reservation={editingReservation}
      />
    </>
  );
}
