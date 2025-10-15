
"use client";

import { useGuestStore } from "@/hooks/use-guest-store";
import { DataTable } from "@/components/waitlist-data-table/data-table";
import { columns } from "@/components/waitlist-data-table/columns";
import { WaitingGuestDialog } from "@/components/waitlist-data-table/waitlist-dialog";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { WaitingGuest } from "@/lib/types";
import { collection, query } from "firebase/firestore";

export function WaitlistClientContent() {
  const { 
    openWaitingGuestDialog, 
    isWaitingGuestDialogOpen, 
    closeWaitingGuestDialog,
    editingWaitingGuest,
  } = useGuestStore();
  const firestore = useFirestore();

  const waitingGuestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'waitingGuests'));
  }, [firestore]);

  const { data: liveWaitingGuests, isLoading } = useCollection<WaitingGuest>(waitingGuestsQuery);

  return (
    <>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mb-8">
          <h1 className="font-headline text-4xl font-bold">Waiting List</h1>
          <p className="text-muted-foreground">
              Manage guests waiting for a table.
          </p>
          </div>

          <DataTable columns={columns} data={liveWaitingGuests || []} onAddWaitingGuest={openWaitingGuestDialog} isLoading={isLoading && !liveWaitingGuests}/>
      </main>
      <WaitingGuestDialog
          key={editingWaitingGuest?.id || 'new-waiting-guest'}
          open={isWaitingGuestDialogOpen}
          onOpenChange={(isOpen) => !isOpen && closeWaitingGuestDialog()}
          guest={editingWaitingGuest}
      />
    </>
  );
}
