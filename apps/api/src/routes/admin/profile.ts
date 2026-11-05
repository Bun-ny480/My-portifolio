import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { ok, created, fail } from "../../utils/http.js";
import { requireAuth } from "../../middleware/auth.js";

export const adminProfileRouter = Router();
adminProfileRouter.use(requireAuth);

const profileUpdateSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  headline: z.string().max(160).optional(),
  bio: z.string().max(5000).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  resumeUrl: z.string().url().optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  location: z.string().max(120).optional(),
  whatsapp: z.string().max(30).optional(),
  mission: z.string().max(2000).optional(),
  vision: z.string().max(2000).optional(),
  philosophy: z.string().max(2000).optional(),
});

const socialSchema = z.object({
  label: z.string().min(1).max(60),
  url: z.string().min(1),
  icon: z.string().min(1).max(40),
  order: z.coerce.number().int().min(0).default(0),
});

adminProfileRouter.get("/", async (_req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { id: "singleton" } });
    const socials = await prisma.socialLink.findMany({ orderBy: { order: "asc" } });
    ok(res, { profile, socials });
  } catch (e) { next(e); }
});

adminProfileRouter.patch("/", async (req, res, next) => {
  try {
    const data = profileUpdateSchema.parse(req.body);
    const profile = await prisma.profile.upsert({
      where: { id: "singleton" },
      update: {
        ...data,
        avatarUrl: data.avatarUrl === "" ? null : data.avatarUrl,
        resumeUrl: data.resumeUrl === "" ? null : data.resumeUrl,
      },
      create: { id: "singleton", ...data },
    });
    ok(res, profile);
  } catch (e) { next(e); }
});

adminProfileRouter.get("/socials", async (_req, res, next) => {
  try {
    ok(res, await prisma.socialLink.findMany({ orderBy: { order: "asc" } }));
  } catch (e) { next(e); }
});

adminProfileRouter.post("/socials", async (req, res, next) => {
  try {
    const data = socialSchema.parse(req.body);
    const row = await prisma.socialLink.create({ data });
    return created(res, row);
  } catch (e) { next(e); }
});

adminProfileRouter.patch("/socials/:id", async (req, res, next) => {
  try {
    const data = socialSchema.partial().parse(req.body);
    const row = await prisma.socialLink.update({ where: { id: req.params.id }, data });
    ok(res, row);
  } catch (e) { next(e); }
});

adminProfileRouter.delete("/socials/:id", async (req, res, next) => {
  try {
    await prisma.socialLink.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) { next(e); }
});
