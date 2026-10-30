import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().default(4000),
  WEB_URL: z.string().url(),
  CORS_ORIGINS: z.string().transform((s) => s.split(",").map((x) => x.trim())),
  DATABASE_URL: z.string(),
  SESSION_SECRET: z.string().min(32),
  CSRF_SECRET: z.string().min(16),
  COOKIE_DOMAIN: z.string().default("localhost"),
  REDIS_URL: z.string().url().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  SMTP_SECURE: z.string().optional().transform((v) => v === "true"),
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_UPLOAD_MB: z.coerce.number().default(8),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;
