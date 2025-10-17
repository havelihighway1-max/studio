"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTables, Table } from "@/hooks/pos/use-tables";
import { WaitlistEntry } from "@/hooks/gro/use-waitlist";
import { doc, updateDoc } from "firebase/firestore";
import { getDb } from "@/firebase/config";

export function AssignTableModal({ entry }: { entry: WaitlistEntry }) {
  const tables = useTables().filter((table) => table.status === "available");

  const assignTable = async (tableId: string) => {
    const db = getDb();

    // Update table status
    const tableRef = doc(db, "tables", tableId);
    await updateDoc(tableRef, { status: "occupied" });

    // Update waitlist entry status
    const waitlistRef = doc(db, "waitlist", entry.id);
    await updateDoc(waitlistRef, { status: "seated", tableId });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Assign Table</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Table for {entry.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4">
          {tables.length > 0 ? (
            tables.map((table) => (
              <Button
                key={table.id}
                variant="outline"
                onClick={() => assignTable(table.id)}
              >
                {table.name}
              </Button>
            ))
          ) : (
            <p>No available tables.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}