import { Router } from "express";
import multer from "multer";
import { randomBytes } from "node:crypto";
import { extname, resolve } from "node:path";
import { mkdirSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { z } from "zod";
import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import { requireAuth } from "../../middleware/auth.js";
import { created, fail, ok } from "../../utils/http.js";

export const adminMediaRouter = Router();
adminMediaRouter.use(requireAuth);

const uploadDir = resolve(env.UPLOAD_DIR);
mkdirSync(uploadDir, { recursive: true });

const allowed = new Set([
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".pdf", ".mp4", ".webm",
  ".mp3", ".wav", ".ogg", ".m4a", ".txt", ".csv", ".doc", ".docx",
  ".ppt", ".pptx", ".xls", ".xlsx", ".zip",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(extname(file.originalname).toLowerCase())) return cb(new Error("File type not allowed"));
    cb(null, true);
  },
});

const mediaTypes = ["NEWS", "PROJECT", "VIDEO", "AUDIO", "DOCUMENT", "OTHER"] as const;
const updateSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  type: z.enum(mediaTypes).optional(),
  published: z.boolean().optional(),
}).strict();

adminMediaRouter.get("/", async (_req, res, next) => {
  try {
    ok(res, await prisma.mediaItem.findMany({ orderBy: { createdAt: "desc" } }));
  } catch (error) { next(error); }
});

adminMediaRouter.post("/", upload.single("file"), async (req, res, next) => {
  if (!req.file) return fail(res, 400, "NO_FILE", "Choose a file to upload");
  const parsed = z.object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().max(1000).optional().default(""),
    type: z.enum(mediaTypes),
    published: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  }).safeParse(req.body);
  if (!parsed.success) {
    await unlink(req.file.path).catch(() => undefined);
    return fail(res, 400, "INVALID_MEDIA", parsed.error.issues[0]?.message ?? "Invalid media details");
  }

  try {
    const item = await prisma.mediaItem.create({
      data: {
        ...parsed.data,
        description: parsed.data.description || null,
        url: `/uploads/${req.file.filename}`,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });
    return created(res, item);
  } catch (error) {
    await unlink(req.file.path).catch(() => undefined);
    return next(error);
  }
});

adminMediaRouter.patch("/:id", async (req, res, next) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return fail(res, 400, "INVALID_MEDIA", parsed.error.issues[0]?.message ?? "Invalid media details");
  try {
    const item = await prisma.mediaItem.update({ where: { id: req.params.id }, data: parsed.data });
    return ok(res, item);
  } catch (error) { next(error); }
});

adminMediaRouter.delete("/:id", async (req, res, next) => {
  try {
    const item = await prisma.mediaItem.delete({ where: { id: req.params.id } });
    if (item.url.startsWith("/uploads/")) {
      const filePath = resolve(uploadDir, item.url.slice("/uploads/".length));
      if (filePath.startsWith(`${uploadDir}/`)) await unlink(filePath).catch(() => undefined);
    }
    return ok(res, { deleted: true });
  } catch (error) { next(error); }
});