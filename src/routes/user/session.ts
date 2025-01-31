import express from "express";
import { SessionService } from "../../services/sessionService";
import { authenticateToken } from "../../middleware/auth";

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
  await SessionService.deactivateUserSessions(req.user!.userId);
  res.json({ success: true, message: "Tüm sessionlar sonlandırıldı" });
});

export default router;
