import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table as TableType } from "@/hooks/pos/use-tables";

export function Table({ table }: { table: TableType }) {
  const statusClasses =
    table.status === "available"
      ? "bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800"
      : "bg-red-100 dark:bg-red-900";

  const content = (
    <Card className={`${statusClasses} transition-colors`}>
      <CardHeader>
        <CardTitle>{table.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{table.status}</p>
      </CardContent>
    </Card>
  );

  if (table.status === "available") {
    return <Link href={`/pos/order/${table.id}`}>{content}</Link>;
  }

  return content;
}