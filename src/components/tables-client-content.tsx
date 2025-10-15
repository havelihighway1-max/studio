
"use client";

import { useMemo, useState } from "react";
import { TableDialog } from "@/components/table-data-table/table-dialog";
import { useGuestStore } from "@/hooks/use-guest-store";
import { Table } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function TablesClientContent() {
  const { 
    openTableDialog, 
    isTableDialogOpen, 
    closeTableDialog,
    editingTable,
    openGuestDialog,
    updateTable,
  } = useGuestStore();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const tablesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'tables'), orderBy('name'));
  }, [firestore]);

  const { data: liveTables, isLoading } = useCollection<Table>(tablesQuery);

  const dataToShow = useMemo(() => liveTables || [], [liveTables]);
  
  const handleTableClick = (table: Table) => {
    if (table.status === 'available') {
      openGuestDialog({ tables: table.name });
      updateTable(table.id, { status: 'occupied' });
    } else {
      setSelectedTable(table);
      setIsConfirmDialogOpen(true);
    }
  };

  const handleConfirmClear = () => {
    if (selectedTable) {
      updateTable(selectedTable.id, { status: 'available' });
      toast({
        title: "Table Cleared",
        description: `${selectedTable.name} is now available.`,
      });
    }
    setIsConfirmDialogOpen(false);
    setSelectedTable(null);
  };

  return (
    <>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mb-8 flex items-center justify-between">
              <div>
                  <h1 className="font-headline text-4xl font-bold">Table View</h1>
                  <p className="text-muted-foreground">
                      Select an available table to seat a guest or clear an occupied table.
                  </p>
              </div>
              <div className="flex items-center gap-2">
                  <Button onClick={openTableDialog} variant="outline">
                      Manage Tables
                  </Button>
              </div>
          </div>
          
          {isLoading && !liveTables ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-4">
                  {Array.from({ length: 24 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                  ))}
              </div>
          ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-4">
                  {dataToShow.map((table) => (
                      <Button
                          key={table.id}
                          variant="outline"
                          onClick={() => handleTableClick(table)}
                          className={cn("h-20 text-lg font-bold flex-col relative", {
                              "bg-green-700 hover:bg-green-800 text-white": table.status === 'available',
                              "bg-red-700 hover:bg-red-800 text-white": table.status === 'occupied',
                              "bg-yellow-600 hover:bg-yellow-700 text-white": table.status === 'reserved'
                          })}
                      >
                          <span>{table.name.replace('Table ', '')}</span>
                          <span className="text-xs font-normal absolute bottom-1 right-2">{table.capacity}</span>
                      </Button>
                  ))}
              </div>
          )}
          
      </main>
      <TableDialog
          key={editingTable?.id || 'new-table'}
          open={isTableDialogOpen}
          onOpenChange={(isOpen) => !isOpen && closeTableDialog()}
          table={editingTable}
          allTables={dataToShow}
      />
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <AlertDialogContent>
          <AlertDialogHeader>
              <AlertDialogTitle>Clear Table {selectedTable?.name}?</AlertDialogTitle>
              <AlertDialogDescription>
              Are you sure you want to mark this table as available? This action cannot be undone.
              </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedTable(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmClear}>Clear Table</AlertDialogAction>
          </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
