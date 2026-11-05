import { Router } from "express";
import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import rateLimit from "express-rate-limit";
import { contactSchema } from "@portfolio/shared";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { ok, created, fail } from "../utils/http.js";

export const publicRouter = Router();

/* ---------- rate limiter for the contact form ---------- */
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: { code: "RATE_LIMITED", message: "Too many requests" } },
});

/* ---------- safe pagination helper ---------- */
const pageParams = (query: Record<string, unknown>) => {
  const page = Math.max(1, Number.parseInt(String(query.page ?? "1"), 10) || 1);
  const limit = Math.max(1, Number.parseInt(String(query.limit ?? "12"), 10) || 12);
  return { page, limit };
};

/* ---------- profile + socials ---------- */
publicRouter.get("/profile", async (_req, res, next) => {
  try {
    const [profile, socials] = await Promise.all([
      prisma.profile.findUnique({ where: { id: "singleton" } }),
      prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
    ]);
    ok(res, { profile, socials });
  } catch (e) { next(e); }
});

/* ---------- skills ---------- */
publicRouter.get("/skills", async (_req, res, next) => {
  try {
    const categories = await prisma.skillCategory.findMany({
      orderBy: { order: "asc" },
      include: { skills: { where: { visible: true }, orderBy: { order: "asc" } } },
    });
    ok(res, categories);
  } catch (e) { next(e); }
});

/* ---------- projects (list) ---------- */
publicRouter.get("/projects", async (req, res, next) => {
  try {
    const { page, limit } = pageParams(req.query);
    const take = Math.min(50, limit);
    const q = String(req.query.q ?? "").trim().slice(0, 100);
    const categorySlug = req.query.category ? String(req.query.category) : undefined;

    const where: Prisma.ProjectWhereInput = {
      published: true,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: (page - 1) * take,
        take,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        select: {
          id: true, title: true, slug: true, description: true,
          featured: true, completedAt: true,
          category: { select: { name: true, slug: true } },
          images: { where: { isCover: true }, take: 1, select: { url: true, alt: true } },
          technologies: { select: { technology: { select: { name: true } } } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    ok(res, items, { page, total, totalPages: Math.ceil(total / take) });
  } catch (e) { next(e); }
});

/* ---------- project detail ---------- */
publicRouter.get("/projects/:slug", async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: { slug: req.params.slug, published: true },
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

/* ---------- services ---------- */
publicRouter.get("/services", async (_req, res, next) => {
  try {
    ok(res, await prisma.service.findMany({ where: { visible: true }, orderBy: { order: "asc" } }));
  } catch (e) { next(e); }
});

/* ---------- blog list ---------- */
publicRouter.get("/blog", async (req, res, next) => {
  try {
    const { page, limit } = pageParams(req.query);
    const take = Math.min(20, limit);
    const tag = req.query.tag ? String(req.query.tag) : undefined;
    const category = req.query.category ? String(req.query.category) : undefined;

    const where: Prisma.BlogPostWhereInput = {
      published: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip: (page - 1) * take,
        take,
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        select: {
          id: true, title: true, slug: true, excerpt: true,
          coverUrl: true, publishedAt: true, featured: true,
          category: { select: { name: true, slug: true } },
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    ok(res, items, { page, total, totalPages: Math.ceil(total / take) });
  } catch (e) { next(e); }
});

/* ---------- blog detail ---------- */
publicRouter.get("/blog/:slug", async (req, res, next) => {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug: req.params.slug, published: true },
      include: { category: true, tags: { include: { tag: true } } },
    });
    if (!post) return fail(res, 404, "NOT_FOUND", "Post not found");
    ok(res, post);
  } catch (e) { next(e); }
});

/* ---------- public media library ---------- */
publicRouter.get("/media", async (_req, res, next) => {
  try {
    const items = await prisma.mediaItem.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, description: true, type: true,
        url: true, originalName: true, mimeType: true, size: true, createdAt: true,
      },
    });
    ok(res, items);
  } catch (error) { next(error); }
});

/* ---------- experience / education / certifications ---------- */
publicRouter.get("/experience", async (_req, res, next) => {
  try { ok(res, await prisma.experience.findMany({ orderBy: { order: "asc" } })); }
  catch (e) { next(e); }
});

publicRouter.get("/education", async (_req, res, next) => {
  try { ok(res, await prisma.education.findMany({ orderBy: { order: "asc" } })); }
  catch (e) { next(e); }
});

publicRouter.get("/certifications", async (_req, res, next) => {
  try { ok(res, await prisma.certification.findMany({ orderBy: { issuedAt: "desc" } })); }
  catch (e) { next(e); }
});

/* ---------- filter helpers ---------- */
publicRouter.get("/project-categories", async (_req, res, next) => {
  try { ok(res, await prisma.projectCategory.findMany({ orderBy: { order: "asc" } })); }
  catch (e) { next(e); }
});

publicRouter.get("/blog-categories", async (_req, res, next) => {
  try { ok(res, await prisma.blogCategory.findMany({ orderBy: { name: "asc" } })); }
  catch (e) { next(e); }
});

publicRouter.get("/blog-tags", async (_req, res, next) => {
  try { ok(res, await prisma.blogTag.findMany({ orderBy: { name: "asc" } })); }
  catch (e) { next(e); }
});

/* ---------- contact form (rate-limited, honeypot, IP-hashed) ---------- */
publicRouter.post("/contact", contactLimiter, async (req, res, next) => {
  try {
    const data = contactSchema.parse(req.body);

    // Honeypot tripped — pretend success, drop silently
    if (data.website) {
      return created(res, { id: null, message: "Message received" });
    }

    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "";
    const ipHash = ip
      ? createHash("sha256").update(ip + (process.env.CSRF_SECRET ?? "")).digest("hex")
      : null;

    const msg = await prisma.contactMessage.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject,
        message: data.message,
        ipHash,
      },
    });

    // Queue notification (worker in jobs/ will send it)
    await prisma.emailNotification.create({
      data: {
        to: env.ADMIN_EMAIL,
        subject: `New contact: ${data.subject}`,
        body: `From ${data.fullName} <${data.email}>\n\n${data.message}`,
        replyTo: data.email,
      },
    });

    return created(res, { id: msg.id, message: "Message received" });
  } catch (e) { next(e); }
});
