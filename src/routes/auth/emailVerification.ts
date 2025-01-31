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

const router = express.Router();
const prisma = new PrismaClient();

// Email doğrulama maili gönder
router.post("/send", authenticateToken, async (req, res, next) => {
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
});

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
