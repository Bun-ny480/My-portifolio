import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma.js";
import { fail } from "../utils/http.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const sid = req.session?.sid as string | undefined;
  if (!sid) return fail(res, 401, "UNAUTHENTICATED", "Login required");

  const session = await prisma.session.findUnique({
    where: { id: sid },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } });
    return fail(res, 401, "UNAUTHENTICATED", "Session expired");
  }
  (req as any).admin = session.user;
  next();
}
