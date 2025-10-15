
import { Table } from "@/lib/types";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getDb } from "@/firebase/config";
import { Header } from "@/components/header";
import { TablesClientContent } from "@/components/tables-client-content";

async function getTables() {
    'use server';
    const db = getDb();
    let tables: Table[] = [];

    try {
        const tablesQuery = query(collection(db, 'tables'), orderBy('name'));
        const tablesSnapshot = await getDocs(tablesQuery);
        tables = tablesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Table[];
    } catch (e) {
        console.error("Could not fetch tables data. This might be due to Firestore API not being enabled.", e);
    }
    
    return tables;
}


export default async function TablesPage() {
  const tables = await getTables();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <TablesClientContent initialTables={tables} />
    </div>
  );
}
