
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Reservation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal, Pen, Trash2, CheckCircle, Ban, Clock } from "lucide-react"
import { useGuestStore } from "@/hooks/use-guest-store"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

const DataTableRowActions = ({ row }: { row: { original: Reservation } }) => {
  const reservation = row.original
  const { openReservationDialog, deleteReservation, updateReservation } = useGuestStore();

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
        <DropdownMenuItem onSelect={() => openReservationDialog(reservation)}>
          <Pen className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => updateReservation(reservation.id, { status: "seated" })}>
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          Mark as Seated
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => updateReservation(reservation.id, { status: "canceled" })}>
          <Ban className="mr-2 h-4 w-4 text-red-500" />
          Mark as Canceled
        </DropdownMenuItem>
         <DropdownMenuItem onSelect={() => updateReservation(reservation.id, { status: "upcoming" })}>
          <Clock className="mr-2 h-4 w-4 text-blue-500" />
          Mark as Upcoming
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => deleteReservation(reservation.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns: ColumnDef<Reservation>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("phone") || 'N/A'}</div>
  },
  {
    accessorKey: "numberOfGuests",
    header: "Guests",
    cell: ({ row }) => <div className="text-center">{row.getValue("numberOfGuests") as number}</div>
  },
  {
    accessorKey: "reservationDate",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Date & Time <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("reservationDate") as Date
      return <div className="text-muted-foreground">{format(date, "PPP p")}</div> // e.g., Jun 21, 2024 7:30 PM
    },
  },
   {
    accessorKey: "advancePayment",
    header: "Advance Payment",
    cell: ({ row }) => {
      const payment = row.getValue("advancePayment") as number | undefined;
      return <div className="text-center">{payment ? `$${payment}` : 'N/A'}</div>
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant: "default" | "secondary" | "destructive" = 
            status === "seated" ? "default" :
            status === "canceled" ? "destructive" :
            "secondary";
        return <Badge variant={variant} className="capitalize">{status}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
