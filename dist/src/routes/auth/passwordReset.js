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
const passwordResetService_1 = require("../../services/passwordResetService");
const responseHandler_1 = require("../../helpers/responseHandler");
/**
 * @swagger
 * /api/auth/password-reset:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Şifre sıfırlama isteği
 *     description: Kullanıcının email adresine şifre sıfırlama bağlantısı gönderir
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Kullanıcının kayıtlı email adresi
 *     responses:
 *       200:
 *         description: Sıfırlama bağlantısı gönderildi
 *       429:
 *         description: Çok fazla deneme
 *
 *   put:
 *     tags:
 *       - Auth
 *     summary: Yeni şifre belirleme
 *     description: Şifre sıfırlama token'ı ile yeni şifre belirleme
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Şifre sıfırlama token'ı
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: Yeni şifre (min 8 karakter)
 *     responses:
 *       200:
 *         description: Şifre başarıyla güncellendi
 *       400:
 *         description: Geçersiz token veya şifre
 *       429:
 *         description: Çok fazla deneme
 */
const router = express_1.default.Router();
const passwordResetService = new passwordResetService_1.PasswordResetService();
// Şifre sıfırlama talebi
router.post("/request", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        yield passwordResetService.requestPasswordReset(email);
        (0, responseHandler_1.sendSuccess)(res, null, "Password reset email sent successfully");
    }
    catch (error) {
        next(error);
    }
}));
// Şifre sıfırlama işlemi
router.post("/confirm", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        yield passwordResetService.resetPassword(token, newPassword);
        (0, responseHandler_1.sendSuccess)(res, null, "Password reset successfully");
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
