import { Router } from "express";
import { loginSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from "@portfolio/shared";
import { prisma } from "../config/prisma.js";
import { verifyPassword, hashPassword } from "../utils/password.js";
import { ok, fail } from "../utils/http.js";
import { requireAuth } from "../middleware/auth.js";
import { randomBytes, createHash } from "node:crypto";

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.adminUser.findUnique({ where: { email } });
    const fakeHash = "$argon2id$v=19$m=65536,t=3,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    const valid = await verifyPassword(user?.passwordHash ?? fakeHash, password).catch(() => false);
    if (!user || !valid) return fail(res, 401, "INVALID_CREDENTIALS", "Invalid email or password");

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8);
    const session = await prisma.session.create({ data: { userId: user.id, expiresAt } });
    req.session.sid = session.id;
    await new Promise<void>((r, j) => req.session.save((e: Error | undefined) => (e ? j(e) : r())));
    return ok(res, { id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (e) { next(e); }
});

authRouter.post("/logout", requireAuth, async (req, res, next) => {
  try {
    const sid = req.session.sid as string;
    await prisma.session.delete({ where: { id: sid } }).catch(() => {});
    req.session.destroy(() => res.clearCookie("sid").status(204).end());
  } catch (e) { next(e); }
});

authRouter.get("/me", requireAuth, (req, res) => {
  const { id, email, name, role } = (req as any).admin;
  ok(res, { id, email, name, role });
});

authRouter.post("/change-password", requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const admin = (req as any).admin;
    const fresh = await prisma.adminUser.findUnique({ where: { id: admin.id } });
    if (!fresh || !(await verifyPassword(fresh.passwordHash, currentPassword)))
      return fail(res, 400, "WRONG_PASSWORD", "Current password is incorrect");
    await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash: await hashPassword(newPassword) } });
    await prisma.session.deleteMany({ where: { userId: admin.id, id: { not: req.session.sid as string } } });
    res.status(204).end();
  } catch (e) { next(e); }
});

authRouter.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (user) {
      const raw = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(raw).digest("hex");
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 1000 * 60 * 30) },
      });
      await prisma.emailNotification.create({
        data: {
          to: user.email,
          subject: "Reset your password",
          body: `Reset link: ${process.env.WEB_URL}/admin/reset-password?token=${raw}`,
        },
      });
    }
    res.status(204).end();
  } catch (e) { next(e); }
});

authRouter.post("/reset-password", async (req, res, next) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!record || record.usedAt || record.expiresAt < new Date())
      return fail(res, 400, "INVALID_TOKEN", "Token is invalid or expired");
    await prisma.$transaction([
      prisma.adminUser.update({ where: { id: record.userId }, data: { passwordHash: await hashPassword(newPassword) } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      prisma.session.deleteMany({ where: { userId: record.userId } }),
    ]);
    res.status(204).end();
  } catch (e) { next(e); }
});
