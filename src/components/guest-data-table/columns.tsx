
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Guest } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal, Pen, Trash2, CheckCircle, FileX, Utensils, ShoppingBag } from "lucide-react"
import { useGuestStore } from "@/hooks/use-guest-store"
import { format } from "date-fns"
import { MessageSquare } from "lucide-react";
import { Badge } from "../ui/badge"


const DataTableRowActions = ({ row }: { row: { original: Guest } }) => {
  const guest = row.original
  const { openGuestDialog, deleteGuest, updateGuest } = useGuestStore();

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
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted print:hidden"
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
         {guest.status === 'open' && (
          <DropdownMenuItem onSelect={() => updateGuest(guest.id, { status: 'closed' })}>
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            Close Order
          </DropdownMenuItem>
        )}
        {guest.status === 'closed' && (
          <DropdownMenuItem onSelect={() => updateGuest(guest.id, { status: 'open' })}>
            <FileX className="mr-2 h-4 w-4 text-orange-500" />
            Re-open Order
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={() => deleteGuest(guest.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleWhatsAppMessage} disabled={!guest.phone}>
            <MessageSquare className="mr-2 h-4 w-4" />
            WhatsApp
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
          className="print:p-0 print:text-left print:w-full print:justify-start"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4 print:hidden" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("phone") || 'N/A'}</div>
  },
  {
    accessorKey: "numberOfGuests",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="print:p-0 print:text-left print:w-full print:justify-start"
        >
          Guests
          <ArrowUpDown className="ml-2 h-4 w-4 print:hidden" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const num = row.getValue("numberOfGuests");
      return <div className="text-muted-foreground text-center">{num as number}</div>
    }
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="print:p-0 print:text-left print:w-full print:justify-start"
      >
        Bill
        <ArrowUpDown className="ml-2 h-4 w-4 print:hidden" />
      </Button>
    ),
    cell: ({ row }) => {
      const total = parseFloat(row.getValue("total") || "0");
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PKR",
      }).format(total);
      return <div className="text-right font-medium">{total > 0 ? formatted : 'N/A'}</div>;
    },
  },
  {
    accessorKey: "orderType",
    header: "Order Type",
    cell: ({ row }) => {
        const orderType = row.getValue("orderType") as string;
        const Icon = orderType === "dine-in" ? Utensils : ShoppingBag;
        return <div className="flex items-center gap-2 capitalize">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {orderType}
        </div>
    }
  },
   {
    accessorKey: "status",
    header: "Order Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant: "outline" | "default" = 
            status === "open" ? "outline" : "default"
        return <Badge variant={variant} className="capitalize">{status}</Badge>
    }
  },
  {
    accessorKey: "visitDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
           className="print:p-0 print:text-left print:w-full print:justify-start"
        >
          Visit Date
          <ArrowUpDown className="ml-2 h-4 w-4 print:hidden" />
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
