"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSecurityMiddleware = void 0;
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const setupSecurityMiddleware = (app) => {
    // Helmet güvenlik başlıkları
    app.use((0, helmet_1.default)());
    // XSS koruması
    app.use(helmet_1.default.xssFilter());
    // CORS güvenliği
    app.use(helmet_1.default.crossOriginResourcePolicy({ policy: "cross-origin" }));
    // Clickjacking koruması
    app.use(helmet_1.default.frameguard({ action: "deny" }));
    // MIME-type sniffing koruması
    app.use(helmet_1.default.noSniff());
    // Global rate limiter
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 dakika
        max: 100, // IP başına limit
        message: "Too many requests from this IP, please try again later.",
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use(limiter);
};
exports.setupSecurityMiddleware = setupSecurityMiddleware;
