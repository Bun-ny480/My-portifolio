import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal("")),
  serviceId: z.string().uuid().optional(),
  subject: z.string().min(3).max(160),
  message: z.string().min(10).max(5000),
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
