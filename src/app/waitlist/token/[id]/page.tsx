
import { doc, getDoc } from 'firebase/firestore';
import { getDb } from '@/firebase/config';
import { WaitingGuest } from '@/lib/types';
import { TokenPrintClientContent } from '@/components/waitlist-token-client-content';

async function getWaitingGuest(id: string): Promise<WaitingGuest | null> {
  if (!id) return null;
  try {
    const db = getDb();
    const guestDocRef = doc(db, 'waitingGuests', id);
    const docSnap = await getDoc(guestDocRef);

    if (docSnap.exists()) {
      // The timestamp will be automatically serialized when passed from RSC to Client Component
      return { ...docSnap.data(), id: docSnap.id } as WaitingGuest;
    }
    return null;
  } catch (error) {
    console.error("Error fetching waiting guest:", error);
    return null;
  }
}

export default async function TokenPrintPage({ params }: { params: { id: string } }) {
  const guest = await getWaitingGuest(params.id);

  if (!guest) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-2xl text-gray-600">Guest not found or could not be loaded.</p>
      </div>
    );
  }

  return <TokenPrintClientContent guest={guest} />;
}
