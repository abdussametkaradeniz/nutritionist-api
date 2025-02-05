import express from "express";
import { SessionService } from "../../services/sessionService";
import { authenticateToken } from "../../middleware/auth";

/**
 * @swagger
 * /api/user/sessions:
 *   get:
 *     tags:
 *       - User
 *     summary: Aktif oturumları listele
 *     description: Kullanıcının tüm aktif oturumlarını getirir
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Oturumlar başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       deviceInfo:
 *                         type: object
 *                         properties:
 *                           browser:
 *                             type: string
 *                           os:
 *                             type: string
 *                           ip:
 *                             type: string
 *                       lastActivity:
 *                         type: string
 *                         format: date-time
 *                       isCurrentSession:
 *                         type: boolean
 *
 *   delete:
 *     tags:
 *       - User
 *     summary: Oturumu sonlandır
 *     description: Belirtilen oturumu sonlandırır
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Sonlandırılacak oturum ID'si
 *     responses:
 *       200:
 *         description: Oturum başarıyla sonlandırıldı
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Oturum bulunamadı
 *
 *   delete:
 *     tags:
 *       - User
 *     summary: Tüm oturumları sonlandır
 *     description: Mevcut oturum hariç tüm oturumları sonlandırır
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tüm oturumlar başarıyla sonlandırıldı
 *       401:
 *         description: Yetkilendirme hatası
 */
const router = express.Router();

// Kullanıcının aktif sessionlarını getir
router.get("/", authenticateToken, async (req, res) => {
  const sessions = await SessionService.getUserSessions(req.user!.userId);
  res.json({ success: true, data: sessions });
});

// Belirli bir session'ı sonlandır
router.delete("/:sessionId", authenticateToken, async (req, res) => {
  await SessionService.deactivateSession(req.params.sessionId);
  res.json({ success: true, message: "Session sonlandırıldı" });
});

// Tüm sessionları sonlandır (diğer cihazlardan çıkış)
router.delete("/all", authenticateToken, async (req, res) => {
  await SessionService.deactivateAllSessions(req.user!.userId);
  res.json({ success: true, message: "Tüm sessionlar sonlandırıldı" });
});

export default router;
