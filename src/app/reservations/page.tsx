
"use client";

import { useGuestStore } from "@/hooks/use-guest-store";
import { Header } from "@/components/header";
import { ReservationDialog } from "@/components/reservation-data-table/reservation-dialog";
import { DataTable } from "@/components/reservation-data-table/data-table";
import { columns } from "@/components/reservation-data-table/columns";

export default function ReservationsPage() {
  const { 
    reservations, 
    openReservationDialog, 
    isReservationDialogOpen, 
    closeReservationDialog,
    editingReservation,
    openGuestDialog // for adding a walk-in guest from this page
  } = useGuestStore();

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

        <DataTable columns={columns} data={reservations} onAddReservation={openReservationDialog}/>
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
