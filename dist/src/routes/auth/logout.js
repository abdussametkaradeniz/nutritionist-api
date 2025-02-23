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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const exception_1 = require("../../domain/exception");
const sessionService_1 = require("src/services/sessionService");
const router = (0, express_1.Router)();
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
router.post("/", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessionId = req.headers["x-session-id"];
        if (!sessionId) {
            throw new exception_1.BusinessException("Session ID gerekli", 400);
        }
        yield sessionService_1.SessionService.deactivateSession(sessionId);
        res.json({ success: true, message: "Başarıyla çıkış yapıldı" });
    }
    catch (error) {
        next(error);
    }
}));
// Tüm oturumları sonlandır
router.post("/all", auth_1.authenticateToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            throw new exception_1.BusinessException("Kullanıcı bulunamadı", 401);
        }
        yield sessionService_1.SessionService.deactivateAllSessions(req.user.userId);
        res.json({ success: true, message: "Tüm oturumlardan çıkış yapıldı" });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
