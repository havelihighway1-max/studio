import { z } from "zod";

export const guestSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().optional(),
  numberOfGuests: z.coerce.number().min(1, { message: "Must have at least one guest." }),
  visitDate: z.date(),
  reservationDate: z.date().optional(),
  preferences: z.string().optional(),
  feedback: z.string().optional(),
});

export type Guest = z.infer<typeof guestSchema>;
