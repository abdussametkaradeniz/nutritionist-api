import { EmailService } from "./emailService";
import { BusinessException } from "../domain/exception";
import { User } from "@prisma/client";
import crypto from "crypto";
import prisma from "../../prisma/client";

export class EmailVerificationService {
  static async sendVerificationEmail(user: User): Promise<void> {
    // Kullanıcının email durumunu kontrol et
    if (user.emailVerified) {
      throw new BusinessException("Email zaten doğrulanmış", 400);
    }

    // Verification token oluştur
    const token = crypto.randomBytes(32).toString("hex");

    // Token'ı veritabanına kaydet
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 saat
        lastUpdatingUser: "SYSTEM",
      },
    });

    // Doğrulama emaili gönder
    await EmailService.sendVerificationEmail(user.email, token);
  }

  static async verifyEmail(token: string): Promise<void> {
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification || !verification.user) {
      throw new BusinessException(
        "Geçersiz veya süresi dolmuş doğrulama kodu",
        400
      );
    }

    // Email'i doğrulanmış olarak işaretle
    await prisma.user.update({
      where: { id: verification.user.id },
      data: { emailVerified: true },
    });
  }

  static async resendVerificationEmail(user: User): Promise<void> {
    const lastVerification = await prisma.emailVerification.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (
      lastVerification &&
      new Date().getTime() - lastVerification.createdAt.getTime() <
        5 * 60 * 1000
    ) {
      throw new BusinessException(
        "Çok sık deneme yapıyorsunuz. Lütfen 5 dakika bekleyin.",
        429
      );
    }

    await this.sendVerificationEmail(user);
  }
}
