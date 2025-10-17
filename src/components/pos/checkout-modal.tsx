"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CheckoutModal({ subtotal }: { subtotal: number }) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | null>(
    null
  );

  const cashTax = 0.15;
  const cardTax = 0.08;

  let tax = 0;
  if (paymentMethod === "cash") {
    tax = subtotal * cashTax;
  } else if (paymentMethod === "card") {
    tax = subtotal * cardTax;
  }

  const total = subtotal + tax;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={subtotal === 0}>Checkout</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rs. {subtotal.toFixed(2)}</span>
          </div>
          {paymentMethod && (
            <div className="flex justify-between">
              <span>Tax</span>
              <span>Rs. {tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>Rs. {total.toFixed(2)}</span>
          </div>
          <div className="flex gap-4">
            <Button
              className="w-full"
              variant={paymentMethod === "cash" ? "default" : "outline"}
              onClick={() => setPaymentMethod("cash")}
            >
              Cash (15% Tax)
            </Button>
            <Button
              className="w-full"
              variant={paymentMethod === "card" ? "default" : "outline"}
              onClick={() => setPaymentMethod("card")}
            >
              Card (8% Tax)
            </Button>
          </div>
          <Button className="w-full" disabled={!paymentMethod}>
            Confirm Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}