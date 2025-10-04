"use client";

import { Header } from "@/components/header";
import { TableDialog } from "@/components/table-data-table/table-dialog";
import { DataTable } from "@/components/table-data-table/data-table";
import { columns } from "@/components/table-data-table/columns";
import { useGuestStore } from "@/hooks/use-guest-store";

export default function TablesPage() {
  const { 
    tables, 
    openTableDialog, 
    isTableDialogOpen, 
    closeTableDialog,
    editingTable,
    openGuestDialog
  } = useGuestStore();

  const handleImport = () => {
    // This is a placeholder for the CSV import functionality.
    // We will implement this in the next step.
    alert("CSV import functionality will be added here.");
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

        <DataTable 
          columns={columns} 
          data={tables} 
          onAddTable={openTableDialog}
          onImport={handleImport}
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
