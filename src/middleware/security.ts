import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Application } from "express";

export const setupSecurityMiddleware = (app: Application) => {
  // Helmet güvenlik başlıkları
  app.use(helmet());

  // XSS koruması
  app.use(helmet.xssFilter());

  // CORS güvenliği
  app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

  // Clickjacking koruması
  app.use(helmet.frameguard({ action: "deny" }));

  // MIME-type sniffing koruması
  app.use(helmet.noSniff());

  // Global rate limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına limit
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(limiter);
};
