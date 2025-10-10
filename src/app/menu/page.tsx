
'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { useGuestStore } from '@/hooks/use-guest-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import menuData from '@/lib/menu-data.json';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Utensils } from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const menu: MenuCategory[] = menuData.menu;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header onAddNewGuest={openGuestDialog} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {!selectedCategory ? (
          <>
            <div className="mb-8">
              <h1 className="font-headline text-4xl font-bold">Menu Categories</h1>
              <p className="text-muted-foreground">Select a category to view its items.</p>
            </div>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pr-4">
                {menu.map((category) => (
                  <Card
                    key={category.category}
                    className="cursor-pointer hover:bg-card/80 hover:border-primary transition-all"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <CardHeader className="items-center text-center">
                      <Utensils className="h-8 w-8 mb-2 text-primary" />
                      <CardTitle className="font-headline text-xl">{category.category}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </>
        ) : (
          <>
            <div className="mb-8 flex items-center gap-4">
               <Button variant="outline" size="icon" onClick={() => setSelectedCategory(null)}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to categories</span>
              </Button>
              <div>
                <h1 className="font-headline text-4xl font-bold">{selectedCategory.category}</h1>
                <p className="text-muted-foreground">A guide to our delicious offerings for your customers.</p>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-8 pr-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline text-3xl">{selectedCategory.category}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    {selectedCategory.items.map((item) => (
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
              </div>
            </ScrollArea>
          </>
        )}
      </main>
    </div>
  );
}
