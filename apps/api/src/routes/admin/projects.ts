import { Router } from "express";
import { z } from "zod";
import { projectCreateSchema, projectUpdateSchema } from "@portfolio/shared";
import { prisma } from "../../config/prisma.js";
import { ok, created, fail } from "../../utils/http.js";
import { requireAuth } from "../../middleware/auth.js";

export const adminProjectsRouter = Router();
adminProjectsRouter.use(requireAuth);

/* ---------- list (includes unpublished) ---------- */
adminProjectsRouter.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(String(req.query.page ?? "1"), 10) || 1);
    const take = Math.min(100, Number.parseInt(String(req.query.limit ?? "20"), 10) || 20);
    const q = String(req.query.q ?? "").trim().slice(0, 100);

    const where = q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: (page - 1) * take,
        take,
        orderBy: { updatedAt: "desc" },
        include: {
          category: { select: { name: true, slug: true } },
          images: { orderBy: { order: "asc" } },
          technologies: { include: { technology: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    ok(res, items, { page, total, totalPages: Math.ceil(total / take) });
  } catch (e) { next(e); }
});

/* ---------- get one by id ---------- */
adminProjectsRouter.get("/:id", async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        images: { orderBy: { order: "asc" } },
        technologies: { include: { technology: true } },
        category: true,
      },
    });
    if (!project) return fail(res, 404, "NOT_FOUND", "Project not found");
    ok(res, project);
  } catch (e) { next(e); }
});

/* ---------- create ---------- */
adminProjectsRouter.post("/", async (req, res, next) => {
  try {
    const data = projectCreateSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        features: data.features,
        challenges: data.challenges || null,
        solutions: data.solutions || null,
        githubUrl: data.githubUrl || null,
        liveUrl: data.liveUrl || null,
        completedAt: data.completedAt ?? null,
        featured: data.featured,
        published: data.published,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        categoryId: data.categoryId,
        technologies: {
          create: data.technologyIds.map((technologyId) => ({ technologyId })),
        },
      },
      include: { images: true, technologies: { include: { technology: true } }, category: true },
    });

    return created(res, project);
  } catch (e) { next(e); }
});

/* ---------- update ---------- */
adminProjectsRouter.patch("/:id", async (req, res, next) => {
  try {
    const data = projectUpdateSchema.parse(req.body);

    const exists = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!exists) return fail(res, 404, "NOT_FOUND", "Project not found");

    const { technologyIds, ...rest } = data;

    const project = await prisma.$transaction(async (tx) => {
      if (technologyIds) {
        await tx.projectTechnology.deleteMany({ where: { projectId: req.params.id } });
        if (technologyIds.length) {
          await tx.projectTechnology.createMany({
            data: technologyIds.map((technologyId) => ({
              projectId: req.params.id,
              technologyId,
            })),
          });
        }
      }
      return tx.project.update({
        where: { id: req.params.id },
        data: {
          ...rest,
          ...(rest.githubUrl === "" ? { githubUrl: null } : {}),
          ...(rest.liveUrl === "" ? { liveUrl: null } : {}),
          ...(rest.seoTitle === "" ? { seoTitle: null } : {}),
          ...(rest.seoDescription === "" ? { seoDescription: null } : {}),
        },
        include: {
          images: { orderBy: { order: "asc" } },
          technologies: { include: { technology: true } },
          category: true,
        },
      });
    });

    ok(res, project);
  } catch (e) { next(e); }
});

/* ---------- delete ---------- */
adminProjectsRouter.delete("/:id", async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) { next(e); }
});

/* ---------- image sub-routes ---------- */
const imageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().min(1).max(200),
  order: z.coerce.number().int().min(0).default(0),
  isCover: z.boolean().default(false),
});

adminProjectsRouter.post("/:id/images", async (req, res, next) => {
  try {
    const data = imageSchema.parse(req.body);
    const projectId = req.params.id;

    const exists = await prisma.project.findUnique({ where: { id: projectId } });
    if (!exists) return fail(res, 404, "NOT_FOUND", "Project not found");

    const image = await prisma.$transaction(async (tx) => {
      if (data.isCover) {
        await tx.projectImage.updateMany({ where: { projectId }, data: { isCover: false } });
      }
      return tx.projectImage.create({ data: { projectId, ...data } });
    });

    return created(res, image);
  } catch (e) { next(e); }
});

adminProjectsRouter.delete("/:id/images/:imageId", async (req, res, next) => {
  try {
    await prisma.projectImage.delete({ where: { id: req.params.imageId } });
    res.status(204).end();
  } catch (e) { next(e); }
});
