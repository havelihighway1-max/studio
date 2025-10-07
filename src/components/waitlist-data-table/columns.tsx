
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { WaitingGuest } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal, Pen, Trash2, CheckCircle, Ban, Clock, Printer } from "lucide-react"
import { useGuestStore } from "@/hooks/use-guest-store"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

const DataTableRowActions = ({ row }: { row: { original: WaitingGuest } }) => {
  const guest = row.original
  const { openWaitingGuestDialog, deleteWaitingGuest, updateWaitingGuest } = useGuestStore();

  const handlePrint = () => {
    const url = `/waitlist/token/${guest.id}`;
    window.open(url, '_blank', 'width=600,height=600');
  }

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
        <DropdownMenuItem onSelect={() => openWaitingGuestDialog(guest)}>
          <Pen className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Token
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => updateWaitingGuest(guest.id, { status: "called" })}>
          <Clock className="mr-2 h-4 w-4 text-blue-500" />
          Mark as Called
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => updateWaitingGuest(guest.id, { status: "seated" })}>
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          Mark as Seated
        </DropdownMenuItem>
         <DropdownMenuItem onSelect={() => updateWaitingGuest(guest.id, { status: "waiting" })}>
          <Ban className="mr-2 h-4 w-4 text-orange-500" />
          Mark as Waiting
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => deleteWaitingGuest(guest.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
          <Trash2 className="mr-2 h-4 w-4" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns: ColumnDef<WaitingGuest>[] = [
  {
    accessorKey: "tokenNumber",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Token #<ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-bold text-lg text-center tabular-nums">{row.getValue("tokenNumber")}</div>,
  },
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
    accessorKey: "numberOfGuests",
    header: "Guests",
    cell: ({ row }) => <div className="text-center">{row.getValue("numberOfGuests") as number}</div>
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("phone") || 'N/A'}</div>
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Time <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      return <div className="text-muted-foreground">{format(date, "p")}</div> // e.g., 7:30 PM
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant: "default" | "secondary" | "destructive" | "outline" = 
            status === "seated" ? "default" :
            status === "called" ? "outline" :
            status === "waiting" ? "secondary" :
            "secondary";
        return <Badge variant={variant} className="capitalize">{status}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
