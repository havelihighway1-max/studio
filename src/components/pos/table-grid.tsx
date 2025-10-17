"use client";

import { Table } from "@/components/pos/table";
import { useTables } from "@/hooks/pos/use-tables";

export function TableGrid() {
  const tables = useTables();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {tables.map((table) => (
        <Table key={table.id} table={table} />
      ))}
    </div>
  );
}