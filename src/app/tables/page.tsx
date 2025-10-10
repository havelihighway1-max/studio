
"use client";

import { useRef, useMemo, useState } from "react";
import Papa from "papaparse";
import { Header } from "@/components/header";
import { TableDialog } from "@/components/table-data-table/table-dialog";
import { useGuestStore } from "@/hooks/use-guest-store";
import { tableSchema, Table } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
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

export default function TablesPage() {
  const { 
    setTables,
    openTableDialog, 
    isTableDialogOpen, 
    closeTableDialog,
    editingTable,
    openGuestDialog,
    addTable,
    updateTable,
  } = useGuestStore();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const tablesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'tables'), orderBy('name'));
  }, [firestore, user]);

  const { data: tables, isLoading } = useCollection<Table>(tablesQuery);

  const safeTables = useMemo(() => tables || [], [tables]);


  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleSeedTables = async () => {
    try {
      const tablesToAdd: Omit<Table, 'id' | 'status'>[] = [];
      for (let i = 101; i <= 206; i++) {
        if (i > 150 && i < 201) continue; // Skip numbers between 150 and 201
        tablesToAdd.push({ name: `Table ${i}`, capacity: 4 });
      }
      // @ts-ignore
      await setTables(tablesToAdd);
      toast({
        title: "Seeding Successful",
        description: "Initial tables have been added.",
      });
    } catch (error) {
      console.error("Seeding Error:", error);
      toast({
        variant: "destructive",
        title: "Seeding Failed",
        description: "An error occurred while adding the tables.",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a CSV file to import.",
      });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedData = results.data.map(row => {
            const parsedRow = tableSchema.omit({ id: true, status: true }).parse({
              ...row,
              capacity: Number((row as any).capacity) 
            });
            return parsedRow;
          });
          
          // @ts-ignore
          await setTables(parsedData as Omit<Table, 'id' | 'status'>[]);

          toast({
            title: "Import Successful",
            description: `${parsedData.length} tables have been imported.`,
          });
        } catch (error) {
           console.error("CSV Parsing Error:", error);
           toast({
            variant: "destructive",
            title: "Import Failed",
            description: "Please check the CSV file format and content. Ensure 'name' and 'capacity' columns are correct.",
          });
        }
      },
      error: (error) => {
        console.error("CSV Error:", error);
        toast({
          variant: "destructive",
          title: "Import Error",
          description: "An error occurred while parsing the CSV file.",
        });
      }
    });

    if(event.target) event.target.value = "";
  };
  
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
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header onAddNewGuest={openGuestDialog} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="font-headline text-4xl font-bold">Table View</h1>
                <p className="text-muted-foreground">
                    Select an available table to seat a guest or clear an occupied table.
                </p>
            </div>
            <div className="flex items-center gap-2">
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv"
                    className="hidden"
                />
                <Button onClick={handleSeedTables} variant="secondary">
                    Seed Initial Tables
                </Button>
                 <Button onClick={openTableDialog} variant="outline">
                    Manage Tables
                </Button>
            </div>
        </div>
        
        {isLoading ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                {Array.from({ length: 24 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                {safeTables.map((table) => (
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
        allTables={safeTables}
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
    </div>
  );
}

