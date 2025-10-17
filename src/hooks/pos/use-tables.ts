import { useState, useEffect } from "react";
import { getDb } from "@/firebase/config";
import { collection, onSnapshot } from "firebase/firestore";

export type Table = {
  id: string;
  name: string;
  status: "available" | "occupied";
};

export function useTables() {
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    const db = getDb();
    const unsub = onSnapshot(collection(db, "tables"), (snapshot) => {
      const tablesData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Table)
      );
      setTables(tablesData);
    });

    return () => unsub();
  }, []);

  return tables;
}