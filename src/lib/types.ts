import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string(),
  price: z.number(),
  quantity: z.number().default(1),
});

export type OrderMenuItem = z.infer<typeof menuItemSchema>;

export const guestSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().optional(),
  numberOfGuests: z.coerce.number().min(1, { message: "Must have at least one guest." }),
  tables: z.string().optional(),
  visitDate: z.date(),
  preferences: z.string().optional(),
  feedback: z.string().optional(),
  orderType: z.enum(["dine-in", "takeaway"]).default("dine-in"),
  paymentMethod: z.enum(["cash", "card"]).default("cash"),
  orderItems: z.array(menuItemSchema).optional(),
  subtotal: z.number().optional(),
  tax: z.number().optional(),
  total: z.number().optional(),
});

export type Guest = z.infer<typeof guestSchema>;

export const reservationSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().optional(),
  numberOfGuests: z.coerce.number().min(1, { message: "Must have at least one guest." }),
  dateOfEvent: z.date(),
  status: z.enum(["upcoming", "seated", "canceled"]).default("upcoming"),
  notes: z.string().optional(),
  advancePayment: z.coerce.number().optional(),
  occasion: z.enum(["birthday", "anniversary", "marriage", "other"]).optional(),
  checkedIn: z.boolean().default(false),
});

export type Reservation = z.infer<typeof reservationSchema>;

export const tableSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Table name cannot be empty." }),
  capacity: z.coerce.number().min(1, { message: "Capacity must be at least 1." }),
  status: z.enum(["available", "occupied", "reserved"]).default("available"),
});

export type Table = z.infer<typeof tableSchema>;

export const waitingGuestSchema = z.object({
  id: z.string(),
  tokenNumber: z.number(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().optional(),
  numberOfGuests: z.coerce.number().min(1, { message: "Must have at least one guest." }),
  status: z.enum(["waiting", "called", "seated"]).default("waiting"),
  createdAt: z.date(),
});

export type WaitingGuest = z.infer<typeof waitingGuestSchema>;
