"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { useGuestStore } from "@/hooks/use-guest-store";
import { columns } from "@/components/guest-data-table/columns";
import { DataTable } from "@/components/guest-data-table/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { GuestDialog } from "@/components/guest-data-table/guest-dialog";
import { InsightsDialog } from "@/components/guest-data-table/insights-dialog";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const guests = useGuestStore((state) => state.guests);
  const {
    isGuestDialogOpen,
    closeGuestDialog,
    editingGuest,
    isInsightsDialogOpen,
    closeInsightsDialog,
  } = useGuestStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mb-4">
            <Skeleton className="h-10 w-48" />
          </div>
          <Skeleton className="h-[60vh] w-full rounded-lg" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <DataTable columns={columns} data={guests} />
        <GuestDialog
          key={editingGuest?.id || 'new'}
          open={isGuestDialogOpen}
          onOpenChange={(isOpen) => !isOpen && closeGuestDialog()}
          guest={editingGuest}
        />
        <InsightsDialog
          open={isInsightsDialogOpen}
          onOpenChange={(isOpen) => !isOpen && closeInsightsDialog()}
        />
      </main>
    </div>
  );
}
