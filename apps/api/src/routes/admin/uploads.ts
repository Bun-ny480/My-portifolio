import { Router } from "express";
import multer from "multer";
import { randomBytes } from "node:crypto";
import { extname, resolve } from "node:path";
import { mkdirSync } from "node:fs";
import { env } from "../../config/env.js";
import { ok, fail } from "../../utils/http.js";
import { requireAuth } from "../../middleware/auth.js";

export const adminUploadsRouter = Router();
adminUploadsRouter.use(requireAuth);

const uploadDir = resolve(env.UPLOAD_DIR);
mkdirSync(uploadDir, { recursive: true });

const allowed = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".pdf"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    if (!allowed.has(ext)) return cb(new Error("File type not allowed"));
    cb(null, true);
  },
});

adminUploadsRouter.post("/", upload.single("file"), (req, res) => {
  if (!req.file) return fail(res, 400, "NO_FILE", "No file uploaded");
  const url = `/uploads/${req.file.filename}`;
  return ok(res, { url, size: req.file.size, name: req.file.originalname });
});
