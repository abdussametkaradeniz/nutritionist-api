import rateLimit from "express-rate-limit";
import { createClient } from "@redis/client";
import { BusinessException } from "../domain/exception";
import RedisStore from "rate-limit-redis";

// Redis client
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || "localhost"}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD,
});

// Test ortamında memory store, production'da Redis store kullan
const getStore = () => {
  if (process.env.NODE_ENV === "test") {
    return undefined; // Memory store kullanır
  }
  return new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: "rate-limit:",
  });
};

// Genel API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100,
  store: getStore(),
  message: "Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoint'leri için özel limiter
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 5,
  store: getStore(),
  message:
    "Çok fazla giriş denemesi yapıldı, lütfen daha sonra tekrar deneyin.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Email gönderimi için özel limiter
export const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 3,
  store: getStore(),
  message:
    "Çok fazla email isteği gönderildi, lütfen daha sonra tekrar deneyin.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Redis bağlantı yönetimi
export async function initializeRateLimiter() {
  if (process.env.NODE_ENV !== "test") {
    try {
      await redisClient.connect();
      console.log("Redis connected successfully for rate limiting");

      redisClient.on("error", (error) => {
        console.error("Redis connection error:", error);
        throw new BusinessException("Rate limiting service unavailable", 503);
      });
    } catch (error) {
      console.error("Redis connection failed:", error);
      throw new BusinessException("Rate limiting service unavailable", 503);
    }
  }
}
