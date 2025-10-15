
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles } from "lucide-react";

interface InsightsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InsightsDialog({ open, onOpenChange }: InsightsDialogProps) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            Guest Data Analysis
          </DialogTitle>
          <DialogDescription>
            AI-powered insights are currently unavailable.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 min-h-[120px]">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                The feature to generate AI-powered insights from guest data is temporarily disabled due to a server-side configuration issue. Please check back later.
            </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
