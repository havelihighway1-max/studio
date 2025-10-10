
'use client';

import { Header } from '@/components/header';
import { useGuestStore } from '@/hooks/use-guest-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import menuData from '@/lib/menu-data.json';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MenuItem {
  name: string;
  description?: string;
  price: number;
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export default function MenuPage() {
  const { openGuestDialog } = useGuestStore();
  const menu: MenuCategory[] = menuData.menu;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header onAddNewGuest={openGuestDialog} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="font-headline text-4xl font-bold">Restaurant Menu</h1>
          <p className="text-muted-foreground">
            A guide to our delicious offerings for your customers.
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-8 pr-4">
            {menu.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="font-headline text-3xl">{category.category}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6">
                  {category.items.map((item) => (
                    <div key={item.name} className="flex items-start justify-between gap-4">
                      <div className="grid gap-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                      </div>
                      <div className="font-semibold tabular-nums">${item.price.toFixed(2)}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
