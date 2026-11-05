import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma.js";
import { ok, fail } from "../../utils/http.js";
import { requireAuth } from "../../middleware/auth.js";
import { env } from "../../config/env.js";
import { isEmailConfigured, sendEmail } from "../../services/email.js";

export const adminMessagesRouter = Router();
adminMessagesRouter.use(requireAuth);

const MESSAGE_STATUSES = ["NEW", "READ", "REPLIED", "ARCHIVED"] as const;
type MessageStatusValue = (typeof MESSAGE_STATUSES)[number];

const statusSchema = z.object({
  status: z.enum(MESSAGE_STATUSES),
});
const replySchema = z.object({
  body: z.string().trim().min(1).max(5000),
}).strict();

/* ==================== CONTACT MESSAGES ==================== */
adminMessagesRouter.get("/contact", async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(String(req.query.page ?? "1"), 10) || 1);
    const take = Math.min(100, Number.parseInt(String(req.query.limit ?? "20"), 10) || 20);
    const statusParam = req.query.status ? String(req.query.status) : undefined;
    const q = String(req.query.q ?? "").trim().slice(0, 100);

    const where = {
      ...(statusParam && MESSAGE_STATUSES.includes(statusParam as MessageStatusValue)
        ? { status: statusParam as MessageStatusValue }
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
        include: { replies: { orderBy: { createdAt: "asc" } } },
      }),
      prisma.contactMessage.count({ where }),
    ]);

    ok(res, items, { page, total, totalPages: Math.ceil(total / take) });
  } catch (e) { next(e); }
});

adminMessagesRouter.get("/contact/:id", async (req, res, next) => {
  try {
    const msg = await prisma.contactMessage.findUnique({
      where: { id: req.params.id },
      include: { replies: { orderBy: { createdAt: "asc" } } },
    });
    if (!msg) return fail(res, 404, "NOT_FOUND", "Message not found");
    ok(res, msg);
  } catch (e) { next(e); }
});

adminMessagesRouter.post("/contact/:id/replies", async (req, res, next) => {
  try {
    const { body } = replySchema.parse(req.body);
    if (!isEmailConfigured()) {
      return fail(res, 503, "EMAIL_NOT_CONFIGURED", "Email delivery is not configured. Configure Gmail SMTP in the API environment.");
    }

    const message = await prisma.contactMessage.findUnique({ where: { id: req.params.id } });
    if (!message) return fail(res, 404, "NOT_FOUND", "Message not found");

    const subject = /^re:\s*/i.test(message.subject) ? message.subject : `Re: ${message.subject}`;
    await sendEmail({
      to: message.email,
      subject,
      text: body,
      replyTo: env.ADMIN_EMAIL,
    });

    const [reply] = await prisma.$transaction([
      prisma.contactMessageReply.create({
        data: { contactMessageId: message.id, body },
      }),
      prisma.contactMessage.update({
        where: { id: message.id },
        data: { status: "REPLIED" },
      }),
    ]);

    return ok(res, reply);
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

    const where = statusParam && MESSAGE_STATUSES.includes(statusParam as MessageStatusValue)
      ? { status: statusParam as MessageStatusValue }
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
