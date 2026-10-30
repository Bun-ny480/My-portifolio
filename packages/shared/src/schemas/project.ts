import { z } from "zod";

export const projectCreateSchema = z.object({
  title: z.string().min(3).max(160),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(160),
  description: z.string().min(20),
  categoryId: z.string().uuid(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  githubUrl: z.string().url().optional().or(z.literal("")),
  liveUrl: z.string().url().optional().or(z.literal("")),
  completedAt: z.coerce.date().optional(),
  features: z.array(z.string()).default([]),
  challenges: z.string().optional(),
  solutions: z.string().optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  technologyIds: z.array(z.string().uuid()).default([]),
});

export const projectUpdateSchema = projectCreateSchema.partial();
