import { useState, useEffect } from "react";
import { getDb } from "@/firebase/config";
import { collection, onSnapshot } from "firebase/firestore";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
};

export function useMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const db = getDb();
    const unsub = onSnapshot(collection(db, "menuItems"), (snapshot) => {
      const menuData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as MenuItem)
      );
      setMenuItems(menuData);
    });

    return () => unsub();
  }, []);

  return menuItems;
}