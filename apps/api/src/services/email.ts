import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";

let transporter: Transporter | null = null;

export function isEmailConfigured() {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT);
}

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  if (!isEmailConfigured()) return null;

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER && env.SMTP_PASS
      ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

export async function sendEmail(email: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  const mailer = getTransporter();
  if (!mailer) throw new Error("Email delivery is not configured. Configure Gmail SMTP in the API environment.");

  await mailer.sendMail({
    from: env.SMTP_FROM ?? "no-reply@localhost",
    ...email,
  });
}
