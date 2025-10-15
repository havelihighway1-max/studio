
'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useGuestStore } from "@/hooks/use-guest-store";
import { useEffect } from "react";

import { BarChart2, CalendarClock, Home, PlusCircle, Table, UserCheck, Utensils } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { openGuestDialog } = useGuestStore();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Home, shortcut: 'd' },
    { href: '/reports', label: 'Reports', icon: BarChart2, shortcut: 'r' },
    { href: '/reservations', label: 'Reservations', icon: CalendarClock, shortcut: 's' },
    { href: '/tables', label: 'Tables', icon: Table, shortcut: 't' },
    { href: '/waitlist', label: 'Waitlist', icon: UserCheck, shortcut: 'w' },
    { href: '/menu', label: 'Menu', icon: Utensils, shortcut: 'm' },
  ];
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts if an input, textarea, or select is focused
      const target = event.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }

      const shortcutMap: { [key: string]: () => void } = {
        'd': () => router.push('/'),
        'r': () => router.push('/reports'),
        's': () => router.push('/reservations'),
        't': () => router.push('/tables'),
        'w': () => router.push('/waitlist'),
        'm': () => router.push('/menu'),
        'a': () => openGuestDialog(),
      };

      const action = shortcutMap[event.key.toLowerCase()];
      if (action) {
        event.preventDefault();
        action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, openGuestDialog]);


  return (
    <SidebarProvider>
      <div className="flex">
        <Sidebar>
          <SidebarHeader>
              <Link href="/" className="font-headline text-2xl font-bold text-primary">
                  HAVELI
              </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map(item => (
                  <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild tooltip={`${item.label} (${item.shortcut})`} isActive={pathname === item.href}>
                          <Link href={item.href}>
                              <item.icon />
                              <span>{item.label}</span>
                          </Link>
                      </SidebarMenuButton>
                  </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => openGuestDialog()} tooltip="Add a walk-in guest (a)">
                      <PlusCircle />
                      <span>Walking Guest</span>
                  </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
              <div className="p-2 text-center text-xs text-muted-foreground/50">
                created by Asif Khan
              </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
