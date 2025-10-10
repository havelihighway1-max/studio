"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { getFirestore, collection, getDocs, writeBatch } from "firebase/firestore";

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
import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


type TableFormValues = z.infer<typeof tableSchema>;

interface TableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table?: Partial<Table> | null;
  allTables: Table[];
}

export function TableDialog({ open, onOpenChange, table, allTables }: TableDialogProps) {
  const { addTable, updateTable, deleteTable, setTables } = useGuestStore();
  const { toast } = useToast();
  const isEditMode = !!table?.id;
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<Omit<TableFormValues, 'id'>>({
    resolver: zodResolver(tableSchema.omit({ id: true })),
    defaultValues: {
      name: table?.name || "",
      capacity: table?.capacity || 1,
      status: table?.status || "available",
    },
  });

  useEffect(() => {
    form.reset({
      name: table?.name || "",
      capacity: table?.capacity || 1,
      status: table?.status || "available",
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
    // Don't close on submit, so user can add multiple tables
    form.reset({ name: '', capacity: 1, status: 'available' }); 
    if(isEditMode) onOpenChange(false);
  }
  
  const handleDeleteAll = async () => {
    setIsLoading(true);
    try {
        const db = getFirestore();
        const tablesCollection = collection(db, 'tables');
        const querySnapshot = await getDocs(tablesCollection);
        const batch = writeBatch(db);
        querySnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        toast({
            title: "All tables deleted",
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Failed to delete tables",
        });
    } finally {
        setIsLoading(false);
    }
  }


  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };
  
  const handleSeedTables = async () => {
    const tablesToAdd: Omit<Table, 'id' | 'status'>[] = [];
    for (let i = 101; i <= 150; i++) {
        tablesToAdd.push({ name: `Table ${i}`, capacity: 4 });
    }
    try {
        await setTables(tablesToAdd);
        toast({
            title: "Tables Seeded",
            description: "Tables 101 to 150 have been added.",
        });
    } catch (e) {
        toast({
            variant: "destructive",
            title: "Error Seeding Tables",
        });
    }
  }


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {isEditMode ? "Edit Table" : "Manage Tables"}
          </DialogTitle>
          <DialogDescription>
             Add, edit, or remove tables from your restaurant layout.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                 <h3 className="text-lg font-medium mb-4 border-b pb-2">{isEditMode ? 'Update Table' : 'Add a New Table'}</h3>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <DialogFooter className="!justify-start">
                            <Button type="submit">{isEditMode ? "Save Changes" : "Add Table"}</Button>
                             {isEditMode && <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>}
                        </DialogFooter>
                    </form>
                </Form>
                 <div className="mt-8 pt-4 border-t">
                    <h4 className="font-medium mb-2">Quick Actions</h4>
                     <Button onClick={handleSeedTables} variant="secondary" className="w-full">
                        Seed Tables (101-150)
                    </Button>
                </div>
            </div>
            <div className="md:col-span-2">
                 <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-lg font-medium">All Tables</h3>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={isLoading || allTables.length === 0}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete All
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete all
                                {allTables.length} tables from your restaurant.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAll}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                 </div>
                <div className="max-h-[50vh] overflow-auto">
                    <DataTable 
                        columns={columns} 
                        data={allTables} 
                        onAddTable={() => {}}
                        onImport={() => {}}
                        isLoading={false}
                        isDialogMode={true}
                    />
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
