import Redis from "ioredis";

/**
 * Redis client for caching live markets, narrative feeds, and leaderboards.
 *
 * The docker-compose file exposes Redis on localhost:6379 by default.
 * You can override via REDIS_URL, e.g. redis://:password@host:port/db
 */
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

redis.on("error", (err) => {
  // We log but do not crash the API if Redis is temporarily unavailable.
  console.error("[redis] error", err.message);
});
