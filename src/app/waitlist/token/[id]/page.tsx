
'use client';

import { useEffect, useState } from 'react';
import { useGuestStore } from '@/hooks/use-guest-store';
import { WaitingGuest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export default function TokenPrintPage({ params }: { params: { id: string } }) {
  const [guest, setGuest] = useState<WaitingGuest | null>(null);
  const getWaitingGuestById = (id: string) => useGuestStore.getState().waitingGuests.find(g => g.id === id);

  useEffect(() => {
    const foundGuest = getWaitingGuestById(params.id);
    if (foundGuest) {
      setGuest(foundGuest);
    }
  }, [params.id]);

  if (!guest) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-2xl text-gray-600">Loading guest details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4 print:bg-white">
      <div className="w-full max-w-xs p-8 text-center bg-white rounded-lg shadow-2xl border-4 border-dashed border-gray-400 print:shadow-none print:border-none">
        <h1 className="text-2xl font-bold font-headline text-gray-800">HAVELI KEBAB & GRILL</h1>
        <p className="mt-2 text-sm text-gray-500">Your Token</p>
        <div className="my-6">
          <p className="text-8xl font-bold text-primary tabular-nums">{guest.tokenNumber}</p>
        </div>
        <p className="text-xl font-semibold text-gray-700">{guest.name}</p>
        <p className="text-md text-gray-600">Party of {guest.numberOfGuests}</p>
        <p className="mt-4 text-xs text-gray-500">
          Issued: {new Date(guest.createdAt).toLocaleTimeString()}
        </p>
      </div>
      <div className="mt-8 text-center print:hidden">
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-5 w-5" />
          Print Token
        </Button>
        <Button variant="link" onClick={() => window.close()} className="ml-4">
          Close
        </Button>
      </div>
    </div>
  );
}
