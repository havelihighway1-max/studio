import Link from "next/link";
import { Flame, PlusCircle, BarChart2 } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  onAddNewGuest: () => void;
}

export function Header({ onAddNewGuest }: HeaderProps) {
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
        </div>
        <Link href="/" className="flex items-center gap-2 justify-center text-center">
          <Flame className="h-7 w-7 text-primary" />
          <h1 className="font-headline text-xl font-bold tracking-wide text-foreground">
            HAVELI KEBAB & GRILL
          </h1>
        </Link>
        <div className="flex items-center gap-2 justify-end">
          <Button onClick={onAddNewGuest}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Guest
          </Button>
        </div>
      </div>
    </header>
  );
}
