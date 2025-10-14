
"use client";

import Link from "next/link";
import { Keyboard } from "lucide-react";
import { Button } from "./ui/button";
import { useKeyboard } from "./keyboard-provider";
import { SidebarTrigger } from "./ui/sidebar";

export function Header() {
  const { toggleKeyboard } = useKeyboard();
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 print:hidden">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <Link href="/" className="hidden font-headline text-2xl font-bold md:block">
                HAVELI KEBAB & GRILL
            </Link>
        </div>
        
        <div className="flex-1">
             {/* Can add search or other header items here */}
        </div>

        <div className="flex items-center gap-2 justify-end">
          <Button onClick={toggleKeyboard} variant="outline" size="icon">
            <Keyboard className="h-4 w-4" />
            <span className="sr-only">Toggle Keyboard</span>
          </Button>
        </div>
      </header>
  );
}
