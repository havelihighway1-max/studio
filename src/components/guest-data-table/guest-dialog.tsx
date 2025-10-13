
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import type { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, Trash2, X } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { useEffect, useMemo, useState, useCallback } from "react";

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import menuData from '@/lib/menu-data.json';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "../ui/scroll-area";

const allMenuItems: { name: string; price: number }[] = menuData.menu.flatMap(category => category.items);

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
      paymentMethod: guest?.paymentMethod || "cash",
      orderItems: guest?.orderItems || [],
      subtotal: guest?.subtotal || 0,
      tax: guest?.tax || 0,
      total: guest?.total || 0,
      status: guest?.status || "open",
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "orderItems",
  });
  
  const orderType = form.watch("orderType");
  const paymentMethod = form.watch("paymentMethod");
  const orderItems = form.watch("orderItems");

  const calculateTotals = useCallback(() => {
    const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxRate = paymentMethod === 'cash' ? 0.15 : 0.08;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    form.setValue('subtotal', subtotal, { shouldValidate: true });
    form.setValue('tax', tax, { shouldValidate: true });
    form.setValue('total', total, { shouldValidate: true });
  }, [orderItems, paymentMethod, form]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

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
        paymentMethod: guest?.paymentMethod || "cash",
        orderItems: guest?.orderItems || [],
        status: guest?.status || "open",
      });
    }
  }, [guest, open, form]);

  function onSubmit(data: GuestFormValues) {
    const sanitizedData = { ...data };
    
    // Firestore does not accept `undefined`.
    if (sanitizedData.subtotal === undefined) delete (sanitizedData as Partial<typeof sanitizedData>).subtotal;
    if (sanitizedData.tax === undefined) delete (sanitizedData as Partial<typeof sanitizedData>).tax;
    if (sanitizedData.total === undefined) delete (sanitizedData as Partial<typeof sanitizedData>).total;

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

  const addMenuItem = (item: { name: string; price: number }) => {
    const existingItem = fields.find(field => field.name === item.name);
    if(existingItem) {
        const existingIndex = fields.findIndex(field => field.id === existingItem.id);
        update(existingIndex, { ...existingItem, quantity: existingItem.quantity + 1 });
    } else {
        append({ name: item.name, price: item.price, quantity: 1 });
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {isEditMode ? "Edit Order" : "New Order"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the details for this guest and their order."
              : "Create a new order for a dine-in or takeaway guest."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Guest Details */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="orderType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Order Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex items-center space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="dine-in" />
                            </FormControl>
                            <FormLabel className="font-normal">Dine-In</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="takeaway" />
                            </FormControl>
                            <FormLabel className="font-normal">Takeaway</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                  {orderType === 'dine-in' && (
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
                  )}
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

              {/* Right Column - Order Details */}
              <div className="space-y-4 rounded-md border p-4">
                <h3 className="text-lg font-medium">Order Items</h3>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Add Item
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                         <Command>
                            <CommandInput placeholder="Search for a menu item..." />
                            <CommandList>
                                <CommandEmpty>No results found.</CommandEmpty>
                                <CommandGroup>
                                {allMenuItems.map((item, index) => (
                                    <CommandItem
                                    key={`${item.name}-${item.price}-${index}`}
                                    value={item.name}
                                    onSelect={() => addMenuItem(item)}
                                    >
                                    <span>{item.name}</span>
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                <ScrollArea className="h-48">
                    <div className="space-y-2 pr-4">
                        {fields.map((item, index) => (
                            <div key={item.id} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50">
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">Price: {item.price}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="number"
                                        min="1"
                                        className="h-8 w-16"
                                        {...form.register(`orderItems.${index}.quantity` as const, { valueAsNumber: true })}
                                    />
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                         {fields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No items in this order yet.</p>}
                    </div>
                </ScrollArea>
                
                <Separator />
                
                <div className="space-y-2">
                    <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                            <FormLabel>Payment Method</FormLabel>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex items-center space-x-4"
                                >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="cash" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Cash (15% Tax)</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="card" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Card (8% Tax)</FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{form.getValues('subtotal')?.toFixed(2) || '0.00'}</span>
                    </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span>{form.getValues('tax')?.toFixed(2) || '0.00'}</span>
                    </div>
                     <div className="flex justify-between items-center font-bold text-md">
                        <span>Total</span>
                        <span>{form.getValues('total')?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEditMode ? "Save Changes" : "Create Order"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
