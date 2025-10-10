
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { summarizeGuestFeedbackAction } from "@/app/actions";
import { Sparkles } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { Guest } from "@/lib/types";
import { collection, query } from "firebase/firestore";

interface InsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

  const { data: guests, isLoading: guestsLoading } = useCollection<Guest>(guestsQuery);

  const getFeedback = () => {
    if (!guests) return [];
    return guests
      .map((guest) => guest.feedback)
      .filter((feedback): feedback is string => !!feedback && feedback.trim() !== '');
  };

  const generateSummary = async () => {
    setIsLoading(true);
    setError("");
    setSummary("");
    const feedback = getFeedback();
    const result = await summarizeGuestFeedbackAction(feedback);
    if (result.success) {
      setSummary(result.summary || "");
    } else {
      setError(result.error || "An unknown error occurred.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (open && !guestsLoading && user) {
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
            Guest Feedback Summary
          </DialogTitle>
          <DialogDescription>
            AI-powered insights from your collected guest feedback.
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
            <p className="text-sm text-foreground leading-relaxed">{summary}</p>
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
