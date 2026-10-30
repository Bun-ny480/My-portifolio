import type { Response } from "express";

export function ok<T>(res: Response, data: T, meta?: object) {
  return res.status(200).json({ ok: true, data, ...(meta ? { meta } : {}) });
}
export function created<T>(res: Response, data: T) {
  return res.status(201).json({ ok: true, data });
}
export function fail(res: Response, status: number, code: string, message: string, details?: unknown) {
  return res.status(status).json({ ok: false, error: { code, message, details } });
}
