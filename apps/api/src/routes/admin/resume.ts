import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { ok, created, fail } from "../../utils/http.js";
import { requireAuth } from "../../middleware/auth.js";

export const adminResumeRouter = Router();
adminResumeRouter.use(requireAuth);

const experienceSchema = z.object({
  title: z.string().min(2).max(160),
  organization: z.string().min(1).max(160),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  description: z.string().min(1),
  order: z.coerce.number().int().min(0).default(0),
});
const educationSchema = z.object({
  institution: z.string().min(1).max(160),
  degree: z.string().min(1).max(160),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  description: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
});
const certificationSchema = z.object({
  name: z.string().min(1).max(160),
  issuer: z.string().min(1).max(160),
  issuedAt: z.coerce.date(),
  url: z.string().url().optional().or(z.literal("")),
});

/* experience */
adminResumeRouter.get("/experience", async (_req, res, next) => {
  try { ok(res, await prisma.experience.findMany({ orderBy: { order: "asc" } })); }
  catch (e) { next(e); }
});
adminResumeRouter.post("/experience", async (req, res, next) => {
  try { return created(res, await prisma.experience.create({ data: experienceSchema.parse(req.body) })); }
  catch (e) { next(e); }
});
adminResumeRouter.patch("/experience/:id", async (req, res, next) => {
  try { ok(res, await prisma.experience.update({ where: { id: req.params.id }, data: experienceSchema.partial().parse(req.body) })); }
  catch (e) { next(e); }
});
adminResumeRouter.delete("/experience/:id", async (req, res, next) => {
  try { await prisma.experience.delete({ where: { id: req.params.id } }); res.status(204).end(); }
  catch (e) { next(e); }
});

/* education */
adminResumeRouter.get("/education", async (_req, res, next) => {
  try { ok(res, await prisma.education.findMany({ orderBy: { order: "asc" } })); }
  catch (e) { next(e); }
});
adminResumeRouter.post("/education", async (req, res, next) => {
  try { return created(res, await prisma.education.create({ data: educationSchema.parse(req.body) })); }
  catch (e) { next(e); }
});
adminResumeRouter.patch("/education/:id", async (req, res, next) => {
  try { ok(res, await prisma.education.update({ where: { id: req.params.id }, data: educationSchema.partial().parse(req.body) })); }
  catch (e) { next(e); }
});
adminResumeRouter.delete("/education/:id", async (req, res, next) => {
  try { await prisma.education.delete({ where: { id: req.params.id } }); res.status(204).end(); }
  catch (e) { next(e); }
});

/* certifications */
adminResumeRouter.get("/certifications", async (_req, res, next) => {
  try { ok(res, await prisma.certification.findMany({ orderBy: { issuedAt: "desc" } })); }
  catch (e) { next(e); }
});
adminResumeRouter.post("/certifications", async (req, res, next) => {
  try {
    const data = certificationSchema.parse(req.body);
    return created(res, await prisma.certification.create({
      data: { ...data, url: data.url === "" ? null : data.url },
    }));
  } catch (e) { next(e); }
});
adminResumeRouter.patch("/certifications/:id", async (req, res, next) => {
  try {
    const data = certificationSchema.partial().parse(req.body);
    ok(res, await prisma.certification.update({
      where: { id: req.params.id },
      data: { ...data, ...(data.url === "" ? { url: null } : {}) },
    }));
  } catch (e) { next(e); }
});
adminResumeRouter.delete("/certifications/:id", async (req, res, next) => {
  try { await prisma.certification.delete({ where: { id: req.params.id } }); res.status(204).end(); }
  catch (e) { next(e); }
});
