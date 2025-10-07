
"use client";

import { useGuestStore } from "@/hooks/use-guest-store";
import { Header } from "@/components/header";
import { DataTable } from "@/components/waitlist-data-table/data-table";
import { columns } from "@/components/waitlist-data-table/columns";
import { WaitingGuestDialog } from "@/components/waitlist-data-table/waitlist-dialog";

export default function WaitlistPage() {
  const { 
    waitingGuests, 
    openWaitingGuestDialog, 
    isWaitingGuestDialogOpen, 
    closeWaitingGuestDialog,
    editingWaitingGuest,
    openGuestDialog // for adding a walk-in guest from other pages
  } = useGuestStore();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header onAddNewGuest={openGuestDialog} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-headline text-4xl font-bold">Waiting List</h1>
          <p className="text-muted-foreground">
            Manage guests waiting for a table.
          </p>
        </div>

        <DataTable columns={columns} data={waitingGuests} onAddWaitingGuest={openWaitingGuestDialog}/>
      </main>
      <WaitingGuestDialog
        key={editingWaitingGuest?.id || 'new-waiting-guest'}
        open={isWaitingGuestDialogOpen}
        onOpenChange={(isOpen) => !isOpen && closeWaitingGuestDialog()}
        guest={editingWaitingGuest}
      />
    </div>
  );
}
