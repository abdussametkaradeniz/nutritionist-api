import express, { NextFunction, Request, Response } from "express";
import { loginSchema } from "../../validations/loginValidator";
import { requestValidator } from "../../middleware/requestValidator";
import { PrismaClient } from "@prisma/client";
import { SessionService } from "../../services/sessionService";
import { BusinessException } from "../../domain/exception";
import { comparePassword } from "../../helpers/password";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import { authLimiter } from "../../middleware/rateLimiter";
import { generateAccessToken, generateRefreshToken } from "../../helpers/jwt";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Kullanıcı girişi
 *     description: Email/username/telefon ve şifre ile kullanıcı girişi yapar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email, username veya telefon numarası
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Kullanıcı şifresi
 *               totpToken:
 *                 type: string
 *                 description: İki faktörlü doğrulama kodu (opsiyonel)
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT token
 *                 refreshToken:
 *                   type: string
 *                   description: Refresh token
 *                 sessionId:
 *                   type: string
 *                   description: Oturum ID
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *       401:
 *         description: Geçersiz kimlik bilgileri
 *       403:
 *         description: 2FA token gerekli
 *       429:
 *         description: Çok fazla deneme
 */
const router = express.Router();
const prisma = new PrismaClient();
const sessionService = new SessionService();

router.post(
  "/",
  requestValidator(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, totpToken } = req.body;

      // Kullanıcıyı bul
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new BusinessException("Kullanıcı bulunamadı", 404);
      }

      // Şifre kontrolü
      const isValidPassword = await comparePassword(
        password,
        user.passwordHash
      );
      if (!isValidPassword) {
        throw new BusinessException("Geçersiz şifre", 401);
      }

      // 2FA kontrol
      if (user.twoFactorEnabled) {
        if (!totpToken) {
          return res.status(403).json({
            requiresTwoFactor: true,
            message: "Please provide 2FA token",
          });
        }

        const verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret!,
          encoding: "base32",
          token: totpToken,
        });

        if (!verified) {
          return res.status(401).json({ error: "Invalid 2FA token" });
        }
      }

      // Access ve Refresh token oluştur
      const accessToken = generateAccessToken(user);
      const refreshToken = await generateRefreshToken(user.id!);

      // Session oluştur
      const sessionId = await SessionService.createSession({
        userId: user.id!,
        deviceId: req.headers["x-device-id"] as string,
        deviceType: req.headers["x-device-type"] as string,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      res.json({
        accessToken,
        refreshToken,
        sessionId,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          dietitianId: user.dietitianId,
          twoFactorEnabled: user.twoFactorEnabled,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
