
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, BarChart2, CalendarClock, Table, UserCheck, LogOut, LogIn, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/firebase";
import { VoiceCommandButton } from "./voice-command-button";

interface HeaderProps {
  onAddNewGuest: () => void;
}

export function Header({ onAddNewGuest }: HeaderProps) {
  const { user, isAdmin } = useAdmin();
  const auth = useAuth();
  const pathname = usePathname();
  const isDashboardPage = pathname === '/dashboard';

  const handleLogout = () => {
    auth.signOut();
  }

  const handleAddNewGuest = () => {
    onAddNewGuest();
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-primary text-primary-foreground">
      <div className="container mx-auto grid h-16 grid-cols-3 items-center px-4 md:px-6">
        <div className="flex items-center gap-2 justify-start">
          {!isDashboardPage ? (
             <Button asChild variant="outline" className="bg-primary hover:bg-primary/90 border-primary-foreground/50 text-primary-foreground">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" className="bg-primary hover:bg-primary/90 border-primary-foreground/50 text-primary-foreground">
                <Link href="/reports">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Reports
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-primary hover:bg-primary/90 border-primary-foreground/50 text-primary-foreground">
                <Link href="/reservations">
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Reservations
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-primary hover:bg-primary/90 border-primary-foreground/50 text-primary-foreground">
                <Link href="/tables">
                  <Table className="mr-2 h-4 w-4" />
                  Tables
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-primary hover:bg-primary/90 border-primary-foreground/50 text-primary-foreground">
                <Link href="/waitlist">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Waitlist
                </Link>
              </Button>
            </>
          )}
        </div>
        <Link href="/" className="flex items-center gap-2 justify-center text-center">
          
        </Link>
        <div className="flex items-center gap-2 justify-end">
          <VoiceCommandButton />
          <Button onClick={handleAddNewGuest} variant="secondary" className="animate-pulse">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Guest
          </Button>
          {user ? (
            <Button variant="ghost" className="hover:bg-primary/80" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Button asChild variant="ghost" className="hover:bg-primary/80">
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
