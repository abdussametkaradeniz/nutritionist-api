import express, { NextFunction, Request, Response } from "express";
import { SessionService } from "../../services/sessionService";
import { TokenService } from "../../services/tokenService";
import { authenticateToken } from "../../middleware/auth";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      const refreshToken = req.body.refreshToken;

      if (sessionId) {
        await SessionService.deactivateSession(sessionId);
      }

      if (refreshToken) {
        await TokenService.revokeRefreshToken(refreshToken);
      }

      res.json({ message: "Başarıyla çıkış yapıldı" });
    } catch (error) {
      next(error);
    }
  }
);

// Tüm oturumlardan çıkış yap
router.post(
  "/all",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new Error("Kullanıcı bulunamadı");
      }

      await SessionService.deactivateUserSessions(userId);
      await TokenService.revokeAllUserRefreshTokens(userId);

      res.json({ message: "Tüm oturumlardan çıkış yapıldı" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
