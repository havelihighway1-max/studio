
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Timestamp } from "firebase/firestore";
import { useEffect } from "react";

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
import { Guest, guestSchema, OrderMenuItem } from "@/lib/types";
import { useGuestStore } from "@/hooks/use-guest-store";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

type GuestFormValues = z.infer<typeof guestSchema>;

interface GuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest?: Partial<Guest> | null;
}

export function GuestDialog({ open, onOpenChange, guest }: GuestDialogProps) {
  const { addGuest, updateGuest } = useGuestStore();
  const { toast } = useToast();
  const isEditMode = !!guest?.id;

  const getVisitDate = () => {
    if(guest?.visitDate) {
      if(guest.visitDate instanceof Timestamp) {
        return guest.visitDate.toDate()
      }
      return new Date(guest.visitDate)
    }
    return new Date();
  }
  
  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      id: guest?.id || "",
      name: guest?.name || "",
      phone: guest?.phone || "",
      numberOfGuests: guest?.numberOfGuests || 1,
      tables: guest?.tables || "",
      visitDate: getVisitDate(),
      preferences: guest?.preferences || "",
      feedback: guest?.feedback || "",
      orderType: guest?.orderType || "dine-in",
      orderItems: guest?.orderItems || [],
      paymentMethod: guest?.paymentMethod || "cash",
      subtotal: guest?.subtotal || 0,
      tax: guest?.tax || 0,
      total: guest?.total || 0,
      status: guest?.status || "open",
    },
  });
  
  const orderType = form.watch("orderType");

  useEffect(() => {
    if (open) {
      form.reset({
        id: guest?.id || crypto.randomUUID(),
        name: guest?.name || "",
        phone: guest?.phone || "",
        numberOfGuests: guest?.numberOfGuests || 1,
        tables: guest?.tables || "",
        visitDate: getVisitDate(),
        preferences: guest?.preferences || "",
        feedback: guest?.feedback || "",
        orderType: guest?.orderType || "dine-in",
        orderItems: guest?.orderItems || [],
        paymentMethod: guest?.paymentMethod || "cash",
        subtotal: guest?.subtotal || 0,
        tax: guest?.tax || 0,
        total: guest?.total || 0,
        status: guest?.status || "open",
      });
    }
  }, [guest, open, form]);

  function onSubmit(data: GuestFormValues) {
    const sanitizedData = { ...data, orderType: 'dine-in' };

    if (isEditMode) {
      updateGuest(data.id, sanitizedData);
      toast({
        title: "Guest Updated",
        description: `${data.name}'s information has been successfully updated.`,
      });
    } else {
      addGuest(sanitizedData);
      toast({
        title: "Guest Added",
        description: `${data.name} has been successfully added to your guest list.`,
      });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {isEditMode ? "Edit Guest" : "New Guest"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the details for this guest."
              : "Create a new entry for a dine-in guest."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                      <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="numberOfGuests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Party Size</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="tables"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Table(s)</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g. 5, 6" {...field} />
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

              <FormField
                control={form.control}
                name="preferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferences / Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Allergic to peanuts, extra spicy..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEditMode ? "Save Changes" : "Create Entry"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
