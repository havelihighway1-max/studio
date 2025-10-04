"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Guest, guestSchema } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal, Pen, Trash2 } from "lucide-react"
import { useGuestStore } from "@/hooks/use-guest-store"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { MessageSquare } from "lucide-react";


const DataTableRowActions = ({ row }: { row: { original: Guest } }) => {
  const guest = row.original
  const { openGuestDialog, deleteGuest } = useGuestStore();

  const handleWhatsAppMessage = () => {
    if (guest.phone) {
      const phoneNumber = guest.phone.replace(/\D/g, '');
      const text = encodeURIComponent(`Hello ${guest.name}! This is a message from Haveli Kebab & Grill.`);
      const url = `https://wa.me/${phoneNumber}?text=${text}`;
      window.open(url, '_blank');
    } else {
      alert("This guest does not have a phone number.");
    }
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onSelect={() => openGuestDialog(guest)}>
          <Pen className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleWhatsAppMessage}>
            <MessageSquare className="mr-2 h-4 w-4" />
            WhatsApp
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => deleteGuest(guest.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns: ColumnDef<Guest>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("phone") || 'N/A'}</div>
  },
  {
    accessorKey: "visitDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Visit Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("visitDate") as Date
      return <div className="text-muted-foreground">{format(date, "PPP")}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
