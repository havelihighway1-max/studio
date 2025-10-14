
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WaitingGuest, waitingGuestSchema } from "@/lib/types";
import { useGuestStore } from "@/hooks/use-guest-store";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";


type WaitingGuestFormValues = z.infer<typeof waitingGuestSchema>;

interface WaitingGuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest?: Partial<WaitingGuest> | null;
}

export function WaitingGuestDialog({ open, onOpenChange, guest }: WaitingGuestDialogProps) {
  const { addWaitingGuest, updateWaitingGuest } = useGuestStore();
  const { toast } = useToast();
  const isEditMode = !!guest?.id;

  const formSchema = waitingGuestSchema.omit({ id: true, tokenNumber: true, createdAt: true });

  const form = useForm<Omit<WaitingGuestFormValues, 'id' | 'tokenNumber' | 'createdAt'>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: guest?.name || "",
      phone: guest?.phone || "",
      numberOfGuests: guest?.numberOfGuests || 1,
      status: guest?.status || "waiting",
      estimatedWaitTime: guest?.estimatedWaitTime || undefined,
    },
  });

  useEffect(() => {
    form.reset({
      name: guest?.name || "",
      phone: guest?.phone || "",
      numberOfGuests: guest?.numberOfGuests || 1,
      status: guest?.status || "waiting",
      estimatedWaitTime: guest?.estimatedWaitTime || undefined,
    });
  }, [guest, form]);

  function onSubmit(data: Omit<WaitingGuestFormValues, 'id' | 'tokenNumber' | 'createdAt'>) {
    if (isEditMode && guest?.id) {
      updateWaitingGuest(guest.id, data);
      toast({
        title: "Guest Updated",
        description: `${data.name} on the waitlist has been updated.`,
      });
    } else {
      addWaitingGuest(data);
      toast({
        title: "Guest Added to Waitlist",
        description: `${data.name} has been added.`,
      });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {isEditMode ? "Edit Waiting Guest" : "Add to Waitlist"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the details for this waiting guest."
              : "Fill in the details for the guest waiting for a table."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="numberOfGuests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Guests</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedWaitTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wait Time (mins)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 15" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>
               <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(123) 456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            {isEditMode && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="called">Called</SelectItem>
                        <SelectItem value="seated">Seated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEditMode ? "Save Changes" : "Add Guest"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
