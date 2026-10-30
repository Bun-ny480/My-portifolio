import { startEmailWorker } from "./jobs/emailWorker.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { sessionMiddleware } from "./config/session.js";
import { publicRouter } from "./routes/public.js";
import { authRouter } from "./routes/auth.js";
import { notFound, errorHandler } from "./middleware/error.js";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  })
);

app.use(pinoHttp({ logger, autoLogging: env.NODE_ENV !== "test" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser(env.CSRF_SECRET));
app.use(sessionMiddleware);

// health check (no auth, no session write)
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, data: { status: "up", env: env.NODE_ENV, time: new Date().toISOString() } });
});

app.use("/api/admin/auth", authRouter);
app.use("/api", publicRouter);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.API_PORT, () => {
  logger.info(`API listening on http://localhost:${env.API_PORT}`);
});
const stopEmailWorker = startEmailWorker();

const shutdown = (signal: string) => {
  logger.info({ signal }, "shutting down");
  stopEmailWorker();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export { app };
