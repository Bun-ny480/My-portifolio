import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { ok, created, fail } from "../../utils/http.js";
import { requireAuth } from "../../middleware/auth.js";

export const adminSkillsRouter = Router();
adminSkillsRouter.use(requireAuth);

const categorySchema = z.object({
  name: z.string().min(2).max(80),
  order: z.coerce.number().int().min(0).default(0),
});

const skillSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  proficiency: z.string().max(40).optional(),
  visible: z.boolean().default(true),
  order: z.coerce.number().int().min(0).default(0),
  categoryId: z.string().uuid(),
});
const skillUpdateSchema = skillSchema.partial();

/* categories */
adminSkillsRouter.get("/categories", async (_req, res, next) => {
  try {
    ok(res, await prisma.skillCategory.findMany({
      orderBy: { order: "asc" },
      include: { skills: { orderBy: { order: "asc" } } },
    }));
  } catch (e) { next(e); }
});

adminSkillsRouter.post("/categories", async (req, res, next) => {
  try {
    const data = categorySchema.parse(req.body);
    return created(res, await prisma.skillCategory.create({ data }));
  } catch (e) { next(e); }
});

adminSkillsRouter.patch("/categories/:id", async (req, res, next) => {
  try {
    const data = categorySchema.partial().parse(req.body);
    ok(res, await prisma.skillCategory.update({ where: { id: req.params.id }, data }));
  } catch (e) { next(e); }
});

adminSkillsRouter.delete("/categories/:id", async (req, res, next) => {
  try {
    await prisma.skillCategory.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) { next(e); }
});

/* skills */
adminSkillsRouter.post("/", async (req, res, next) => {
  try {
    const data = skillSchema.parse(req.body);
    return created(res, await prisma.skill.create({ data }));
  } catch (e) { next(e); }
});

adminSkillsRouter.patch("/:id", async (req, res, next) => {
  try {
    const data = skillUpdateSchema.parse(req.body);
    ok(res, await prisma.skill.update({ where: { id: req.params.id }, data }));
  } catch (e) { next(e); }
});

adminSkillsRouter.delete("/:id", async (req, res, next) => {
  try {
    await prisma.skill.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) { next(e); }
});
