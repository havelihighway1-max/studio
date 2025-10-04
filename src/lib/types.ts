import { z } from "zod";

export const guestSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().optional(),
  visitDate: z.date(),
  preferences: z.string().optional(),
  feedback: z.string().optional(),
});

export type Guest = z.infer<typeof guestSchema>;
