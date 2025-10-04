import { Flame, PlusCircle } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  onAddNewGuest: () => void;
}

export function Header({ onAddNewGuest }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Flame className="h-7 w-7 text-primary" />
          <h1 className="font-headline text-3xl font-bold tracking-wide text-foreground">
            DineData
          </h1>
        </div>
        <Button onClick={onAddNewGuest}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Guest
        </Button>
      </div>
    </header>
  );
}
