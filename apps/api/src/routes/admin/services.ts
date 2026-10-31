import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { ok, created, fail } from "../../utils/http.js";
import { requireAuth } from "../../middleware/auth.js";

export const adminServicesRouter = Router();
adminServicesRouter.use(requireAuth);

const serviceSchema = z.object({
  title: z.string().min(2).max(160),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(2).max(160),
  description: z.string().min(10).max(2000),
  deliverables: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  priceFrom: z.coerce.number().int().min(0).optional(),
  icon: z.string().min(1).max(40),
  visible: z.boolean().default(true),
  order: z.coerce.number().int().min(0).default(0),
});
const serviceUpdateSchema = serviceSchema.partial();

adminServicesRouter.get("/", async (_req, res, next) => {
  try { ok(res, await prisma.service.findMany({ orderBy: { order: "asc" } })); }
  catch (e) { next(e); }
});

adminServicesRouter.get("/:id", async (req, res, next) => {
  try {
    const row = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!row) return fail(res, 404, "NOT_FOUND", "Service not found");
    ok(res, row);
  } catch (e) { next(e); }
});

adminServicesRouter.post("/", async (req, res, next) => {
  try {
    const data = serviceSchema.parse(req.body);
    return created(res, await prisma.service.create({ data }));
  } catch (e) { next(e); }
});

adminServicesRouter.patch("/:id", async (req, res, next) => {
  try {
    const data = serviceUpdateSchema.parse(req.body);
    ok(res, await prisma.service.update({ where: { id: req.params.id }, data }));
  } catch (e) { next(e); }
});

adminServicesRouter.delete("/:id", async (req, res, next) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) { next(e); }
});
