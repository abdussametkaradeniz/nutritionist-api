import { Request, Response, NextFunction } from "express";
import { SessionService } from "../services/sessionService";
import { BusinessException } from "../domain/exception";

export const sessionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next();
    }

    // Session oluştur veya güncelle
    const sessionId = req.cookies["sessionId"];

    if (sessionId) {
      // Mevcut session'ı güncelle
      await SessionService.updateSession(sessionId, {
        lastActivity: new Date(),
      });
    } else {
      // Yeni session oluştur
      const session = await SessionService.createSession({
        userId: req.user.userId,
        deviceId: req.headers["x-device-id"] as string,
        deviceType: req.headers["x-device-type"] as string,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      // Session ID'yi cookie olarak kaydet
      res.cookie("sessionId", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 gün
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
