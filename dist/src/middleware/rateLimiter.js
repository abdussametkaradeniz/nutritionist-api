"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageLimiter = exports.chatLimiter = exports.appointmentLimiter = exports.pricingLimiter = exports.workingHoursLimiter = exports.dietitianProfileLimiter = exports.emailLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const redis_1 = require("../lib/redis");
// Redis store'u oluştur
const getStore = () => {
    return new rate_limit_redis_1.default({
        sendCommand: (...args) => __awaiter(void 0, void 0, void 0, function* () { return redis_1.redis.sendCommand(args); }),
    });
};
// Genel API rate limiter
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100,
    store: getStore(),
    message: "Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.",
    standardHeaders: true,
    legacyHeaders: false,
});
// Auth endpoint'leri için özel limiter
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10, // 1 saat
    max: 300,
    store: getStore(),
    message: "Çok fazla giriş denemesi yapıldı, lütfen daha sonra tekrar deneyin.",
    standardHeaders: true,
    legacyHeaders: false,
});
// Email gönderimi için özel limiter
exports.emailLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 3,
    store: getStore(),
    message: "Çok fazla email isteği gönderildi, lütfen daha sonra tekrar deneyin.",
    standardHeaders: true,
    legacyHeaders: false,
});
// Diyetisyen profil işlemleri için rate limiter
exports.dietitianProfileLimiter = (0, express_rate_limit_1.default)({
    store: new rate_limit_redis_1.default({
        sendCommand: (...args) => __awaiter(void 0, void 0, void 0, function* () { return redis_1.redis.sendCommand(args); }),
    }),
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına maksimum istek
    message: {
        error: "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Çalışma saatleri güncellemeleri için rate limiter
exports.workingHoursLimiter = (0, express_rate_limit_1.default)({
    store: new rate_limit_redis_1.default({
        sendCommand: (...args) => __awaiter(void 0, void 0, void 0, function* () { return redis_1.redis.sendCommand(args); }),
    }),
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 30, // IP başına maksimum istek
    message: {
        error: "Çalışma saatleri çok sık güncelleniyor. Lütfen daha sonra tekrar deneyin.",
    },
});
// Fiyatlandırma güncellemeleri için rate limiter
exports.pricingLimiter = (0, express_rate_limit_1.default)({
    store: new rate_limit_redis_1.default({
        sendCommand: (...args) => __awaiter(void 0, void 0, void 0, function* () { return redis_1.redis.sendCommand(args); }),
    }),
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 20, // IP başına maksimum istek
    message: {
        error: "Fiyatlandırma çok sık güncelleniyor. Lütfen daha sonra tekrar deneyin.",
    },
});
exports.appointmentLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 dakika
    max: 5, // IP başına 5 istek
    message: {
        error: "Çok fazla randevu isteği gönderdiniz. Lütfen daha sonra tekrar deneyin.",
    },
});
// Rate limiter middleware'i
exports.chatLimiter = (0, express_rate_limit_1.default)({
    store: getStore(),
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // Her IP için maksimum istek sayısı
    message: "Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.",
});
// Mesaj gönderme için daha sıkı limit
exports.messageLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 1000, // 10 saniye
    max: 5, // IP başına 5 mesaj
    message: { error: "Çok hızlı mesaj gönderiyorsunuz. Lütfen yavaşlayın." },
    standardHeaders: true,
    legacyHeaders: false,
});
