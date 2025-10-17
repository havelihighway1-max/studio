"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckoutModal } from "@/components/pos/checkout-modal";
import { useMenu, MenuItem } from "@/hooks/pos/use-menu";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export default function OrderPage({ params }: { params: { tableId: string } }) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const menuItems = useMenu();

  const addToOrder = (item: MenuItem) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const subtotal = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <h1 className="text-2xl font-bold">Order for Table {params.tableId}</h1>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-2">Menu</h2>
            <div className="grid grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Rs. {item.price}</p>
                    <Button className="mt-2" onClick={() => addToOrder(item)}>
                      Add to Order
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
            <Card>
              <CardContent className="p-4">
                {orderItems.length === 0 ? (
                  <p>No items in order yet.</p>
                ) : (
                  <>
                    <ul>
                      {orderItems.map((item) => (
                        <li key={item.id} className="flex justify-between">
                          <span>
                            {item.name} x {item.quantity}
                          </span>
                          <span>Rs. {item.price * item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Subtotal</span>
                      <span>Rs. {subtotal}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            <div className="mt-4">
              <CheckoutModal subtotal={subtotal} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}