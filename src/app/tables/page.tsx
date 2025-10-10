
"use client";

import { useRef, useMemo } from "react";
import Papa from "papaparse";
import { Header } from "@/components/header";
import { TableDialog } from "@/components/table-data-table/table-dialog";
import { DataTable } from "@/components/table-data-table/data-table";
import { columns } from "@/components/table-data-table/columns";
import { useGuestStore } from "@/hooks/use-guest-store";
import { tableSchema, Table } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";

export default function TablesPage() {
  const { 
    setTables,
    openTableDialog, 
    isTableDialogOpen, 
    closeTableDialog,
    editingTable,
    openGuestDialog
  } = useGuestStore();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tablesQuery = useMemoFirebase(() => query(collection(firestore, 'tables')), [firestore]);
  const { data: tables, isLoading } = useCollection<Table>(tablesQuery);

  const safeTables = useMemo(() => tables || [], [tables]);


  const handleImportClick = () => {
    fileInputRef.current?.click();
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
            const parsedRow = tableSchema.omit({ id: true }).parse({
              ...row,
              // Papaparse reads everything as strings, so we coerce
              capacity: Number((row as any).capacity) 
            });
            return parsedRow;
          });
          
          await setTables(parsedData as Omit<Table, 'id'>[]);

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

    // Reset the file input
    if(event.target) event.target.value = "";
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header onAddNewGuest={openGuestDialog} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-headline text-4xl font-bold">Table Management</h1>
          <p className="text-muted-foreground">
            Define and manage your restaurant's table layout.
          </p>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
        />

        <DataTable 
          columns={columns} 
          data={safeTables} 
          onAddTable={openTableDialog}
          onImport={handleImportClick}
          isLoading={isLoading}
        />
      </main>
      <TableDialog
        key={editingTable?.id || 'new-table'}
        open={isTableDialogOpen}
        onOpenChange={(isOpen) => !isOpen && closeTableDialog()}
        table={editingTable}
      />
    </div>
  );
}
