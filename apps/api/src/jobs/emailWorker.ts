import { prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";
import { isEmailConfigured, sendEmail } from "../services/email.js";

const MAX_ATTEMPTS = 5;
const POLL_MS = 30_000;
const BATCH = 20;

async function processBatch() {
  if (!isEmailConfigured()) {
    return;
  }

  const pending = await prisma.emailNotification.findMany({
    where: { status: "PENDING", attempts: { lt: MAX_ATTEMPTS } },
    orderBy: { createdAt: "asc" },
    take: BATCH,
  });
  if (pending.length === 0) return;

  for (const row of pending) {
    try {
      await sendEmail({
        to: row.to,
        subject: row.subject,
        text: row.body,
        replyTo: row.replyTo ?? undefined,
      });
      await prisma.emailNotification.update({
        where: { id: row.id },
        data: { status: "SENT", lastError: null },
      });
      logger.info({ id: row.id, to: row.to }, "email sent");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const attempts = row.attempts + 1;
      const status = attempts >= MAX_ATTEMPTS ? "FAILED" : "PENDING";
      await prisma.emailNotification.update({
        where: { id: row.id },
        data: { attempts, status, lastError: message },
      });
      logger.warn({ id: row.id, attempts, status, err: message }, "email send failed");
    }
  }
}

export function startEmailWorker() {
  if (!isEmailConfigured()) {
    logger.warn("SMTP not configured — email worker disabled");
    return () => {};
  }
  logger.info({ pollMs: POLL_MS }, "email worker started");

  let running = true;
  const tick = async () => {
    if (!running) return;
    try {
      await processBatch();
    } catch (err) {
      logger.error({ err }, "email worker tick failed");
    }
    if (running) setTimeout(tick, POLL_MS);
  };
  setTimeout(tick, 2000);

  return () => {
    running = false;
    logger.info("email worker stopped");
  };
}
