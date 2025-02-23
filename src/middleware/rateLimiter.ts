import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redis } from "../lib/redis";

// Redis store'u oluştur
const getStore = () => {
  return new RedisStore({
    sendCommand: async (...args: string[]): Promise<any> =>
      redis.sendCommand(args),
  });
};

// Genel API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10000000,
  store: getStore(),
  message: "Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoint'leri için özel limiter
export const authLimiter = rateLimit({
  windowMs: 10, // 1 saat
  max: 300,
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

// Diyetisyen profil işlemleri için rate limiter
export const dietitianProfileLimiter = rateLimit({
  store: getStore(),
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına maksimum istek
  message: {
    error: "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Çalışma saatleri güncellemeleri için rate limiter
export const workingHoursLimiter = rateLimit({
  store: getStore(),
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 30, // IP başına maksimum istek
  message: {
    error:
      "Çalışma saatleri çok sık güncelleniyor. Lütfen daha sonra tekrar deneyin.",
  },
});

// Fiyatlandırma güncellemeleri için rate limiter
export const pricingLimiter = rateLimit({
  store: getStore(),
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 20, // IP başına maksimum istek
  message: {
    error:
      "Fiyatlandırma çok sık güncelleniyor. Lütfen daha sonra tekrar deneyin.",
  },
});

export const appointmentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 5, // IP başına 5 istek
  message: {
    error:
      "Çok fazla randevu isteği gönderdiniz. Lütfen daha sonra tekrar deneyin.",
  },
});

// Rate limiter middleware'i
export const chatLimiter = rateLimit({
  store: getStore(),
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // Her IP için maksimum istek sayısı
  message: "Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.",
});

// Mesaj gönderme için daha sıkı limit
export const messageLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 saniye
  max: 5, // IP başına 5 mesaj
  message: { error: "Çok hızlı mesaj gönderiyorsunuz. Lütfen yavaşlayın." },
  standardHeaders: true,
  legacyHeaders: false,
});
