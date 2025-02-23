import { Router, Request, Response, NextFunction } from "express";
import { authenticateToken } from "../../middleware/auth";
import { BusinessException } from "../../domain/exception";
import { SessionService } from "../../services/sessionService";

const router = Router();

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Kullanıcı çıkışı
 *     description: Kullanıcı oturumunu sonlandırır ve refresh token'ı geçersiz kılar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Geçersiz kılınacak refresh token
 *     responses:
 *       200:
 *         description: Başarıyla çıkış yapıldı
 *       401:
 *         description: Geçersiz token
 */
// Tek oturumu sonlandır
router.post(
  "/",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      if (!sessionId) {
        throw new BusinessException("Session ID gerekli", 400);
      }
      await SessionService.deactivateSession(sessionId);
      res.json({ success: true, message: "Başarıyla çıkış yapıldı" });
    } catch (error) {
      next(error);
    }
  }
);

// Tüm oturumları sonlandır
router.post(
  "/all",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.userId) {
        throw new BusinessException("Kullanıcı bulunamadı", 401);
      }
      await SessionService.deactivateAllSessions(req.user.userId);
      res.json({ success: true, message: "Tüm oturumlardan çıkış yapıldı" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
