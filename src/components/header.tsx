
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PlusCircle, BarChart2, CalendarClock, Table, UserCheck, ArrowLeft, Utensils, Keyboard, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useUser } from "@/firebase";
import { auth } from "@/firebase/provider"; // Import from provider
import { useKeyboard } from "./keyboard-provider";
import { signOut } from "firebase/auth";


interface HeaderProps {
  onAddNewGuest: () => void;
}

export function Header({ onAddNewGuest }: HeaderProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isDashboardPage = pathname === '/';
  const { toggleKeyboard } = useKeyboard();

  const handleAddNewGuest = () => {
    onAddNewGuest();
  }
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  if (isAuthPage) {
    return null; // Don't render the header on auth pages
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background print:hidden">
      <div className="container mx-auto grid h-16 grid-cols-3 items-center px-4 md:px-6">
        <div className="flex items-center gap-2 justify-start">
          {!isDashboardPage ? (
             <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          ) : (
            <>
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
               <Button asChild variant="outline">
                <Link href="/menu">
                  <Utensils className="mr-2 h-4 w-4" />
                  Menu
                </Link>
              </Button>
            </>
          )}
        </div>
        <Link href="/" className="flex items-center gap-2 justify-center text-center">
          
        </Link>
        <div className="flex items-center gap-2 justify-end">
          <Button onClick={toggleKeyboard} variant="outline" size="icon">
            <Keyboard className="h-4 w-4" />
            <span className="sr-only">Toggle Keyboard</span>
          </Button>
          {!isUserLoading && user && (
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          )}
          <Button onClick={handleAddNewGuest} variant="default" disabled={isUserLoading}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Guest
          </Button>
        </div>
      </div>
    </header>
  );
}
