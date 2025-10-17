"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWaitlist, WaitlistEntry } from "@/hooks/gro/use-waitlist";
import { addDoc, collection } from "firebase/firestore";
import { getDb } from "@/firebase/config";
import { AssignTableModal } from "./assign-table-modal";

export function GroClientContent() {
  const [name, setName] = useState("");
  const [partySize, setPartySize] = useState(1);
  const waitlist = useWaitlist();

  const addToWaitlist = async () => {
    if (!name || partySize <= 0) return;
    const db = getDb();
    await addDoc(collection(db, "waitlist"), {
      name,
      partySize,
      status: "waiting",
      token: Math.floor(Math.random() * 1000) + 1, // Simple token generation
      createdAt: new Date(),
    });
    setName("");
    setPartySize(1);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h2 className="text-xl font-semibold mb-2">Add to Waitlist</h2>
        <div className="flex flex-col gap-4">
          <Input
            placeholder="Guest Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Party Size"
            value={partySize}
            onChange={(e) => setPartySize(parseInt(e.target.value))}
            min="1"
          />
          <Button onClick={addToWaitlist}>Add Guest</Button>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Waiting Guests</h2>
        <Card>
          <CardContent className="p-4">
            {waitlist.length === 0 ? (
              <p>No guests waiting.</p>
            ) : (
              <ul>
                {waitlist.map((entry) => (
                  <li key={entry.id} className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-bold">{entry.name} (Party of {entry.partySize})</p>
                      <p className="text-sm text-gray-500">Token: {entry.token}</p>
                    </div>
                    <AssignTableModal entry={entry} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}