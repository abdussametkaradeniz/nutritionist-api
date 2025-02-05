import { createClient } from "@redis/client";

export const redis = createClient({
  url: `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD,
});

redis.connect().catch(console.error);
