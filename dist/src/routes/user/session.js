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
const express_1 = __importDefault(require("express"));
const sessionService_1 = require("../../services/sessionService");
const auth_1 = require("../../middleware/auth");
/**
 * @swagger
 * /api/user/sessions:
 *   get:
 *     tags: [User]
 *     summary: Get user sessions
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
 * /api/user/sessions/{sessionId}:
 *   delete:
 *     tags: [User]
 *     summary: Delete specific session
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
 * /api/user/sessions/all:
 *   delete:
 *     tags: [User]
 *     summary: Delete all sessions
 *     description: Mevcut oturum hariç tüm oturumları sonlandırır
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tüm oturumlar başarıyla sonlandırıldı
 *       401:
 *         description: Yetkilendirme hatası
 */
const router = express_1.default.Router();
// Kullanıcının aktif sessionlarını getir
router.get("/", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sessions = yield sessionService_1.SessionService.getUserSessions(req.user.userId);
    res.json({ success: true, data: sessions });
}));
// Belirli bir session'ı sonlandır
router.delete("/:sessionId", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield sessionService_1.SessionService.deactivateSession(req.params.sessionId);
    res.json({ success: true, message: "Session sonlandırıldı" });
}));
// Tüm sessionları sonlandır (diğer cihazlardan çıkış)
router.delete("/all", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield sessionService_1.SessionService.deactivateAllSessions(req.user.userId);
    res.json({ success: true, message: "Tüm sessionlar sonlandırıldı" });
}));
exports.default = router;
