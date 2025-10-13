
"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { summarizeGuestDataAction } from "@/app/actions";
import { Sparkles } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { Guest } from "@/lib/types";
import { collection, query, Timestamp } from "firebase/firestore";

interface InsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type GuestWithTimestamp = Omit<Guest, 'visitDate'> & { visitDate: Timestamp | Date };

export function InsightsDialog({ open, onOpenChange }: InsightsDialogProps) {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useUser();
  const firestore = useFirestore();

  const guestsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'guests'));
  }, [firestore, user]);

  const { data: guests, isLoading: guestsLoading } = useCollection<GuestWithTimestamp>(guestsQuery);
  const safeGuests = useMemo(() => guests || [], [guests]);


  const generateSummary = async () => {
    setIsLoading(true);
    setError("");
    setSummary("");
    const result = await summarizeGuestDataAction(safeGuests);
    if (result.success) {
      setSummary(result.summary || "");
    } else {
      setError(result.error || "An unknown error occurred.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (open && !guestsLoading && user && safeGuests.length > 0) {
      generateSummary();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, guestsLoading, user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            Guest Data Analysis
          </DialogTitle>
          <DialogDescription>
            AI-powered insights from your collected guest data, analyzed by date.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 min-h-[120px]">
          {isLoading || guestsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{summary}</p>
          )}
        </div>
        <div className="flex justify-end">
            <Button onClick={generateSummary} disabled={isLoading || guestsLoading}>
                {isLoading || guestsLoading ? "Generating..." : "Regenerate"}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
