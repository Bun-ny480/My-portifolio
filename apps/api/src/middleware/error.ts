import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger.js";
import { fail } from "../utils/http.js";

export function notFound(_req: Request, res: Response) {
  fail(res, 404, "NOT_FOUND", "Resource not found");
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return fail(res, 400, "VALIDATION_ERROR", "Invalid input", err.flatten());
  }
  logger.error({ err }, "Unhandled error");
  const msg = process.env.NODE_ENV === "production" ? "Internal server error" : String(err);
  return fail(res, 500, "INTERNAL", msg);
}
