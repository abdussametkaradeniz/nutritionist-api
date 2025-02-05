import express from "express";
import { PrismaClient } from "@prisma/client";
import { EmailService } from "../../services/emailService";
import { EmailVerificationService } from "../../services/emailVerificationService";
import { BusinessException } from "../../domain/exception";
import { authenticateToken } from "../../middleware/auth";
import {
  EmailVerificationResponse,
  EmailVerificationStatusResponse,
} from "../../types/response/emailVerification";
import { emailLimiter } from "../../middleware/rateLimiter";
import { Response, NextFunction, RequestHandler } from "express";

/**
 * @swagger
 * /api/auth/email-verification:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Email doğrulama isteği
 *     description: Kullanıcının email adresine doğrulama bağlantısı gönderir
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
 *                 description: Doğrulanacak email adresi
 *     responses:
 *       200:
 *         description: Doğrulama emaili gönderildi
 *       429:
 *         description: Çok fazla deneme
 *
 *   get:
 *     tags:
 *       - Auth
 *     summary: Email doğrulama
 *     description: Email doğrulama token'ı ile hesabı doğrular
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email doğrulama token'ı
 *     responses:
 *       200:
 *         description: Email başarıyla doğrulandı
 *       400:
 *         description: Geçersiz veya süresi dolmuş token
 *       404:
 *         description: Token bulunamadı
 *
 *   put:
 *     tags:
 *       - Auth
 *     summary: Email doğrulama token'ı yenileme
 *     description: Süresi dolmuş email doğrulama token'ını yeniler
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
 *                 description: Doğrulanacak email adresi
 *     responses:
 *       200:
 *         description: Yeni doğrulama emaili gönderildi
 *       429:
 *         description: Çok fazla deneme
 */
const router = express.Router();
const prisma = new PrismaClient();

const sendVerificationHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new BusinessException("Kullanıcı bulunamadı", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BusinessException("Kullanıcı bulunamadı", 404);
    }

    if (user.emailVerified) {
      throw new BusinessException("Email zaten doğrulanmış", 400);
    }

    // Email verification service'i kullan
    await EmailVerificationService.sendVerificationEmail(user);

    const response: EmailVerificationResponse = {
      message: "Doğrulama emaili gönderildi",
      status: "success",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

router.post("/send", authenticateToken, sendVerificationHandler);

// Email doğrulama
router.post("/verify", async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new BusinessException("Token gerekli", 400);
    }

    await EmailVerificationService.verifyEmail(token);

    const response: EmailVerificationResponse = {
      message: "Email başarıyla doğrulandı",
      status: "success",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Email doğrulama durumunu kontrol et
router.get("/status", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new BusinessException("Kullanıcı bulunamadı", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true },
    });

    if (!user) {
      throw new BusinessException("Kullanıcı bulunamadı", 404);
    }

    const response: EmailVerificationStatusResponse = {
      verified: user.emailVerified,
      message: user.emailVerified ? "Email doğrulanmış" : "Email doğrulanmamış",
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
