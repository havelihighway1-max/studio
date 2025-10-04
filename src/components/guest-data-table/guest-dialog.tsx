"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

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
import { Guest, guestSchema } from "@/lib/types";
import { useGuestStore } from "@/hooks/use-guest-store";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

type GuestFormValues = z.infer<typeof guestSchema>;

interface GuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest?: Guest | null;
}

export function GuestDialog({ open, onOpenChange, guest }: GuestDialogProps) {
  const { addGuest, updateGuest } = useGuestStore();
  const { toast } = useToast();
  const isEditMode = !!guest;

  const form = useForm<Omit<GuestFormValues, 'id'>>({
    resolver: zodResolver(guestSchema.omit({ id: true })),
    defaultValues: {
      name: guest?.name || "",
      phone: guest?.phone || "",
      numberOfGuests: guest?.numberOfGuests || 1,
      tables: guest?.tables || "",
      visitDate: guest?.visitDate || new Date(),
      preferences: guest?.preferences || "",
      feedback: guest?.feedback || "",
    },
  });

  function onSubmit(data: Omit<GuestFormValues, 'id'>) {
    if (isEditMode && guest) {
      updateGuest(guest.id, data);
      toast({
        title: "Guest Updated",
        description: `${data.name}'s information has been successfully updated.`,
      });
    } else {
      addGuest(data);
      toast({
        title: "Guest Added",
        description: `${data.name} has been successfully added to your guest list.`,
      });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {isEditMode ? "Edit Guest" : "Add New Guest"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the details for this guest entry."
              : "Fill in the details below to add a new guest entry."}
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
            <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="visitDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Visit Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>
             <FormField
              control={form.control}
              name="preferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferences</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Allergic to peanuts, prefers window seat..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback / Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Enjoyed the special, service was excellent..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
