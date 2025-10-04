import { Flame } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Flame className="h-7 w-7 text-primary" />
          <h1 className="font-headline text-3xl font-bold text-foreground tracking-wide">
            EmberTable
          </h1>
        </div>
      </div>
    </header>
  );
}
