import session from "express-session";
import RedisStore from "connect-redis";
import Redis from "ioredis";
import { env } from "./env.js";
import { logger } from "./logger.js";

let store: session.Store | undefined;

if (env.REDIS_URL) {
  const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: false,
    enableOfflineQueue: false,
  });
  redis.on("error", (err) => logger.warn({ err }, "redis error (session store)"));
  redis.on("connect", () => logger.info("redis connected (session store)"));

  store = new (RedisStore as any)({
    client: redis,
    prefix: "sess:",
  });
} else {
  logger.warn("REDIS_URL not set — falling back to in-memory session store (dev only)");
}

export const sessionMiddleware = session({
  name: "sid",
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    domain: env.COOKIE_DOMAIN,
    maxAge: 1000 * 60 * 60 * 8,
  },
  store,
});
