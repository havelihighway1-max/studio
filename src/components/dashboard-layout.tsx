
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { useGuestStore } from "@/hooks/use-guest-store";

import { BarChart2, CalendarClock, Home, Keyboard, PlusCircle, Table, UserCheck, Utensils } from "lucide-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { openGuestDialog } = useGuestStore();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/reports', label: 'Reports', icon: BarChart2 },
    { href: '/reservations', label: 'Reservations', icon: CalendarClock },
    { href: '/tables', label: 'Tables', icon: Table },
    { href: '/waitlist', label: 'Waitlist', icon: UserCheck },
    { href: '/menu', label: 'Menu', icon: Utensils },
  ];

  return (
    <SidebarProvider>
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
                    <SidebarMenuButton asChild tooltip={item.label} isActive={pathname === item.href}>
                        <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
             <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => openGuestDialog()} tooltip="Add a walk-in guest">
                        <PlusCircle />
                        <span>Walking Guest</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
             </SidebarMenu>
            <div className="p-2 text-center text-xs text-muted-foreground/50">
              created by Asif Khan
            </div>
        </SidebarFooter>
      </Sidebar>
      {children}
    </SidebarProvider>
  );
}
