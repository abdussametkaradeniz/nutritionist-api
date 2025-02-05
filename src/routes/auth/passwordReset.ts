import express from "express";
import { PasswordResetService } from "../../services/passwordResetService";
import { sendSuccess } from "../../helpers/responseHandler";

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
const router = express.Router();
const passwordResetService = new PasswordResetService();

// Şifre sıfırlama talebi
router.post("/request", async (req, res, next) => {
  try {
    const { email } = req.body;
    await passwordResetService.requestPasswordReset(email);
    sendSuccess(res, null, "Password reset email sent successfully");
  } catch (error) {
    next(error);
  }
});

// Şifre sıfırlama işlemi
router.post("/confirm", async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await passwordResetService.resetPassword(token, newPassword);
    sendSuccess(res, null, "Password reset successfully");
  } catch (error) {
    next(error);
  }
});

export default router;
