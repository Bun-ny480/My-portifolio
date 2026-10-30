import { Router } from "express";
import { z } from "zod";
import { MessageStatus } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { ok, fail } from "../../utils/http.js";
import { requireAuth } from "../../middleware/auth.js";

export const adminMessagesRouter = Router();
adminMessagesRouter.use(requireAuth);

const statusSchema = z.object({
  status: z.nativeEnum(MessageStatus),
});

/* ==================== CONTACT MESSAGES ==================== */
adminMessagesRouter.get("/contact", async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(String(req.query.page ?? "1"), 10) || 1);
    const take = Math.min(100, Number.parseInt(String(req.query.limit ?? "20"), 10) || 20);
    const statusParam = req.query.status ? String(req.query.status) : undefined;
    const q = String(req.query.q ?? "").trim().slice(0, 100);

    const where = {
      ...(statusParam && Object.values(MessageStatus).includes(statusParam as MessageStatus)
        ? { status: statusParam as MessageStatus }
        : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
              { subject: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where, skip: (page - 1) * take, take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.contactMessage.count({ where }),
    ]);

    ok(res, items, { page, total, totalPages: Math.ceil(total / take) });
  } catch (e) { next(e); }
});

adminMessagesRouter.get("/contact/:id", async (req, res, next) => {
  try {
    const msg = await prisma.contactMessage.findUnique({ where: { id: req.params.id } });
    if (!msg) return fail(res, 404, "NOT_FOUND", "Message not found");
    ok(res, msg);
  } catch (e) { next(e); }
});

adminMessagesRouter.patch("/contact/:id", async (req, res, next) => {
  try {
    const { status } = statusSchema.parse(req.body);
    const msg = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { status },
    });
    ok(res, msg);
  } catch (e) { next(e); }
});

adminMessagesRouter.delete("/contact/:id", async (req, res, next) => {
  try {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) { next(e); }
});

/* ==================== SERVICE INQUIRIES ==================== */
adminMessagesRouter.get("/inquiries", async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(String(req.query.page ?? "1"), 10) || 1);
    const take = Math.min(100, Number.parseInt(String(req.query.limit ?? "20"), 10) || 20);
    const statusParam = req.query.status ? String(req.query.status) : undefined;

    const where = statusParam && Object.values(MessageStatus).includes(statusParam as MessageStatus)
      ? { status: statusParam as MessageStatus }
      : {};

    const [items, total] = await Promise.all([
      prisma.serviceInquiry.findMany({
        where, skip: (page - 1) * take, take,
        orderBy: { createdAt: "desc" },
        include: { service: { select: { title: true, slug: true } } },
      }),
      prisma.serviceInquiry.count({ where }),
    ]);

    ok(res, items, { page, total, totalPages: Math.ceil(total / take) });
  } catch (e) { next(e); }
});

adminMessagesRouter.patch("/inquiries/:id", async (req, res, next) => {
  try {
    const { status } = statusSchema.parse(req.body);
    const row = await prisma.serviceInquiry.update({
      where: { id: req.params.id },
      data: { status },
    });
    ok(res, row);
  } catch (e) { next(e); }
});

adminMessagesRouter.delete("/inquiries/:id", async (req, res, next) => {
  try {
    await prisma.serviceInquiry.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) { next(e); }
});
