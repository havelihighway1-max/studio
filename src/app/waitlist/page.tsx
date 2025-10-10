
"use client";

import { useGuestStore } from "@/hooks/use-guest-store";
import { Header } from "@/components/header";
import { DataTable } from "@/components/waitlist-data-table/data-table";
import { columns } from "@/components/waitlist-data-table/columns";
import { WaitingGuestDialog } from "@/components/waitlist-data-table/waitlist-dialog";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { WaitingGuest } from "@/lib/types";
import { collection, query } from "firebase/firestore";
import { useMemo } from "react";

export default function WaitlistPage() {
  const { 
    openWaitingGuestDialog, 
    isWaitingGuestDialogOpen, 
    closeWaitingGuestDialog,
    editingWaitingGuest,
    openGuestDialog // for adding a walk-in guest from other pages
  } = useGuestStore();
  const firestore = useFirestore();

  const waitingGuestsQuery = useMemoFirebase(() => query(collection(firestore, 'waitingGuests')), [firestore]);
  const { data: waitingGuests, isLoading } = useCollection<WaitingGuest>(waitingGuestsQuery);
  const safeWaitingGuests = useMemo(() => waitingGuests || [], [waitingGuests]);

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

        <DataTable columns={columns} data={safeWaitingGuests} onAddWaitingGuest={openWaitingGuestDialog} isLoading={isLoading}/>
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
