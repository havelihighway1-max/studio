import { useState, useEffect } from "react";
import { getDb } from "@/firebase/config";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";

export type WaitlistEntry = {
  id: string;
  name: string;
  partySize: number;
  status: "waiting" | "seated";
  token: number;
  createdAt: Date;
};

export function useWaitlist() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);

  useEffect(() => {
    const db = getDb();
    const q = query(
        collection(db, "waitlist"),
        where("status", "==", "waiting"),
        orderBy("createdAt")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const waitlistData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as WaitlistEntry)
      );
      setWaitlist(waitlistData);
    });

    return () => unsub();
  }, []);

  return waitlist;
}