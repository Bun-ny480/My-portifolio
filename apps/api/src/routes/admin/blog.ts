import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { ok, created, fail } from "../../utils/http.js";
import { requireAuth } from "../../middleware/auth.js";

export const adminBlogRouter = Router();
adminBlogRouter.use(requireAuth);

/* ---------- schemas ---------- */
const postCreateSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(200),
  excerpt: z.string().min(10).max(500),
  content: z.string().min(20),
  coverUrl: z.string().url().optional().or(z.literal("")),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  categoryId: z.string().uuid().optional(),
  tagIds: z.array(z.string().uuid()).default([]),
});
const postUpdateSchema = postCreateSchema.partial();

const categorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(2).max(80),
});
const tagSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(2).max(80),
});

/* ---------- posts: list ---------- */
adminBlogRouter.get("/posts", async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(String(req.query.page ?? "1"), 10) || 1);
    const take = Math.min(100, Number.parseInt(String(req.query.limit ?? "20"), 10) || 20);
    const q = String(req.query.q ?? "").trim().slice(0, 100);
    const published = req.query.published === "true" ? true : req.query.published === "false" ? false : undefined;

    const where = {
      ...(q ? { OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { excerpt: { contains: q, mode: "insensitive" as const } },
      ] } : {}),
      ...(published !== undefined ? { published } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where, skip: (page - 1) * take, take,
        orderBy: [{ published: "asc" }, { updatedAt: "desc" }],
        include: {
          category: { select: { name: true, slug: true } },
          tags: { include: { tag: true } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    ok(res, items, { page, total, totalPages: Math.ceil(total / take) });
  } catch (e) { next(e); }
});

/* ---------- posts: get one ---------- */
adminBlogRouter.get("/posts/:id", async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: req.params.id },
      include: { category: true, tags: { include: { tag: true } } },
    });
    if (!post) return fail(res, 404, "NOT_FOUND", "Post not found");
    ok(res, post);
  } catch (e) { next(e); }
});

/* ---------- posts: create ---------- */
adminBlogRouter.post("/posts", async (req, res, next) => {
  try {
    const data = postCreateSchema.parse(req.body);
    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverUrl: data.coverUrl || null,
        published: data.published,
        featured: data.featured,
        publishedAt: data.published ? new Date() : null,
        categoryId: data.categoryId || null,
        tags: { create: data.tagIds.map((tagId) => ({ tagId })) },
      },
      include: { category: true, tags: { include: { tag: true } } },
    });
    return created(res, post);
  } catch (e) { next(e); }
});

/* ---------- posts: update ---------- */
adminBlogRouter.patch("/posts/:id", async (req, res, next) => {
  try {
    const data = postUpdateSchema.parse(req.body);
    const exists = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    if (!exists) return fail(res, 404, "NOT_FOUND", "Post not found");

    const { tagIds, ...rest } = data;
    // publishedAt: set when flipping published=false → true, clear when → false
    const publishedAt =
      rest.published === true && !exists.published
        ? new Date()
        : rest.published === false
        ? null
        : undefined;

    const post = await prisma.$transaction(async (tx) => {
      if (tagIds) {
        await tx.blogPostTag.deleteMany({ where: { postId: req.params.id } });
        if (tagIds.length) {
          await tx.blogPostTag.createMany({
            data: tagIds.map((tagId) => ({ postId: req.params.id, tagId })),
          });
        }
      }
      return tx.blogPost.update({
        where: { id: req.params.id },
        data: {
          ...rest,
          ...(rest.coverUrl === "" ? { coverUrl: null } : {}),
          ...(publishedAt !== undefined ? { publishedAt } : {}),
        },
        include: { category: true, tags: { include: { tag: true } } },
      });
    });

    ok(res, post);
  } catch (e) { next(e); }
});

/* ---------- posts: delete ---------- */
adminBlogRouter.delete("/posts/:id", async (req, res, next) => {
  try {
    await prisma.blogPost.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) { next(e); }
});

/* ---------- categories ---------- */
adminBlogRouter.get("/categories", async (_req, res, next) => {
  try {
    ok(res, await prisma.blogCategory.findMany({ orderBy: { name: "asc" } }));
  } catch (e) { next(e); }
});

adminBlogRouter.post("/categories", async (req, res, next) => {
  try {
    const data = categorySchema.parse(req.body);
    const row = await prisma.blogCategory.create({ data });
    return created(res, row);
  } catch (e) { next(e); }
});

adminBlogRouter.delete("/categories/:id", async (req, res, next) => {
  try {
    await prisma.blogCategory.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) { next(e); }
});

/* ---------- tags ---------- */
adminBlogRouter.get("/tags", async (_req, res, next) => {
  try {
    ok(res, await prisma.blogTag.findMany({ orderBy: { name: "asc" } }));
  } catch (e) { next(e); }
});

adminBlogRouter.post("/tags", async (req, res, next) => {
  try {
    const data = tagSchema.parse(req.body);
    const row = await prisma.blogTag.create({ data });
    return created(res, row);
  } catch (e) { next(e); }
});

adminBlogRouter.delete("/tags/:id", async (req, res, next) => {
  try {
    await prisma.blogTag.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) { next(e); }
});
