
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Header } from '@/components/header';
import { useGuestStore } from '@/hooks/use-guest-store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import menuData from '@/lib/menu-data.json';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Utensils, Plus, Minus, Trash2 } from 'lucide-react';
import { OrderMenuItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

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
  const [orderItems, setOrderItems] = useState<OrderMenuItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const menu: MenuCategory[] = menuData.menu;

  const handleAddItem = (item: MenuItem) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.name === item.name);
      if (existingItem) {
        return prevItems.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (name: string, quantity: number) => {
    if (quantity < 1) {
      handleRemoveItem(name);
    } else {
      setOrderItems((prevItems) =>
        prevItems.map((i) => (i.name === name ? { ...i, quantity } : i))
      );
    }
  };

  const handleRemoveItem = (name: string) => {
    setOrderItems((prevItems) => prevItems.filter((i) => i.name !== name));
  };
  
  const { subtotal, tax, total } = useMemo(() => {
    const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxRate = paymentMethod === 'cash' ? 0.15 : 0.08;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [orderItems, paymentMethod]);

  const handlePlaceOrder = () => {
    openGuestDialog({ 
      orderItems: orderItems,
      paymentMethod: paymentMethod,
      subtotal: subtotal,
      tax: tax,
      total: total
    });
    setOrderItems([]);
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header onAddNewGuest={() => openGuestDialog()} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {!selectedCategory ? (
              <>
                <div className="mb-8">
                  <h1 className="font-headline text-4xl font-bold">Menu Categories</h1>
                  <p className="text-muted-foreground">Select a category to view its items.</p>
                </div>
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pr-4">
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
                  <div className="grid md:grid-cols-2 gap-4 pr-4">
                    {selectedCategory.items.map((item) => (
                      <Card key={item.name} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{item.name}</CardTitle>
                            {item.description && <CardDescription>{item.description}</CardDescription>}
                        </CardHeader>
                        <CardContent className="flex-grow"></CardContent>
                        <CardFooter className="flex justify-between items-center">
                          <div className="font-semibold tabular-nums text-lg">{item.price.toFixed(2)}</div>
                          <Button onClick={() => handleAddItem(item)}>
                              <Plus className="mr-2 h-4 w-4" /> Add to Order
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
          <div className="lg:col-span-1">
             <Card className="sticky top-24">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Current Order</CardTitle>
                    <CardDescription>Items will appear here as you add them.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[calc(100vh-580px)]">
                        <div className="space-y-4 pr-4">
                            {orderItems.length === 0 ? (
                                <p className="text-center text-muted-foreground py-16">No items added yet.</p>
                            ) : (
                                orderItems.map(item => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">Price: {item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.name, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                                            <Input type="number" value={item.quantity} onChange={(e) => handleUpdateQuantity(item.name, parseInt(e.target.value) || 1)} className="h-8 w-14 text-center" />
                                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.name, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemoveItem(item.name)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                {orderItems.length > 0 && (
                    <CardFooter className="flex-col items-stretch space-y-4">
                         <Separator />
                          <div className="space-y-2">
                            <RadioGroup
                                value={paymentMethod}
                                onValueChange={(value: 'cash' | 'card') => setPaymentMethod(value)}
                                className="flex items-center space-x-4 py-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="cash" id="cash" />
                                    <Label htmlFor="cash" className="font-normal">Cash (15% Tax)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="card" id="card" />
                                    <Label htmlFor="card" className="font-normal">Card (8% Tax)</Label>
                                </div>
                            </RadioGroup>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span>{tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>Total</span>
                                <span>{total.toFixed(2)}</span>
                            </div>
                        </div>
                        <Button size="lg" className="w-full" onClick={handlePlaceOrder}>Place Order</Button>
                    </CardFooter>
                )}
             </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
