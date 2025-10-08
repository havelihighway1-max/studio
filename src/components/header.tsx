import Link from "next/link";
import { PlusCircle, BarChart2, CalendarClock, Table, UserCheck, LogOut, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/firebase";

interface HeaderProps {
  onAddNewGuest: () => void;
}

export function Header({ onAddNewGuest }: HeaderProps) {
  const { user, isAdmin } = useAdmin();
  const auth = useAuth();

  const handleLogout = () => {
    auth.signOut();
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto grid h-16 grid-cols-3 items-center px-4 md:px-6">
        <div className="flex items-center gap-2 justify-start">
          <Button asChild variant="outline">
            <Link href="/reports">
              <BarChart2 className="mr-2 h-4 w-4" />
              Reports
            </Link>
          </Button>
           <Button asChild variant="outline">
            <Link href="/reservations">
              <CalendarClock className="mr-2 h-4 w-4" />
              Reservations
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/tables">
              <Table className="mr-2 h-4 w-4" />
              Tables
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/waitlist">
              <UserCheck className="mr-2 h-4 w-4" />
              Waitlist
            </Link>
          </Button>
        </div>
        <Link href="/" className="flex items-center gap-2 justify-center text-center">
          
        </Link>
        <div className="flex items-center gap-2 justify-end">
          <Button onClick={onAddNewGuest} className="animate-pulse">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Guest
          </Button>
          {user ? (
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Button asChild variant="ghost">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Admin Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
