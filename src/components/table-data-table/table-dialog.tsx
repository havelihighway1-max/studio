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
import { Table, tableSchema } from "@/lib/types";
import { useGuestStore } from "@/hooks/use-guest-store";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

type TableFormValues = z.infer<typeof tableSchema>;

interface TableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table?: Partial<Table> | null;
}

export function TableDialog({ open, onOpenChange, table }: TableDialogProps) {
  const { addTable, updateTable } = useGuestStore();
  const { toast } = useToast();
  const isEditMode = !!table?.id;

  const form = useForm<Omit<TableFormValues, 'id'>>({
    resolver: zodResolver(tableSchema.omit({ id: true })),
    defaultValues: {
      name: table?.name || "",
      capacity: table?.capacity || 1,
    },
  });

  useEffect(() => {
    form.reset({
      name: table?.name || "",
      capacity: table?.capacity || 1,
    });
  }, [table, form]);


  function onSubmit(data: Omit<TableFormValues, 'id'>) {
    if (isEditMode && table?.id) {
      updateTable(table.id, data);
      toast({
        title: "Table Updated",
        description: `Table ${data.name}'s information has been successfully updated.`,
      });
    } else {
      addTable(data);
      toast({
        title: "Table Added",
        description: `Table ${data.name} has been successfully added.`,
      });
    }
    onOpenChange(false);
    form.reset();
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {isEditMode ? "Edit Table" : "Add New Table"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the details for this table."
              : "Fill in the details below to add a new table."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Name / Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., T1 or 'Window Booth'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{isEditMode ? "Save Changes" : "Add Table"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
