import { EmailService } from "./emailService";
import { BusinessException } from "../domain/exception";
import { User } from "@prisma/client";
import crypto from "crypto";
import { EmailVerificationRepository } from "../repositories/emailVerificationRepository";

export class EmailVerificationService {
  static async sendVerificationEmail(user: User): Promise<void> {
    // Kullanıcının email durumunu kontrol et
    if (user.emailVerified) {
      throw new BusinessException("Email zaten doğrulanmış", 400);
    }

    // Verification token oluştur
    const token = crypto.randomBytes(32).toString("hex");

    // Token'ı veritabanına kaydet
    await EmailVerificationRepository.createVerificationToken({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 saat
    });

    // Doğrulama emaili gönder
    await EmailService.sendVerificationEmail(user.email, token);
  }

  static async verifyEmail(token: string): Promise<void> {
    // Token'ı kontrol et
    const verification =
      await EmailVerificationRepository.getVerificationToken(token);

    if (!verification || !verification.user) {
      throw new BusinessException(
        "Geçersiz veya süresi dolmuş doğrulama kodu",
        400
      );
    }

    // Email'i doğrulanmış olarak işaretle
    await EmailVerificationRepository.markEmailAsVerified(verification.user.id);
  }

  static async resendVerificationEmail(user: User): Promise<void> {
    // Son 5 dakika içinde gönderilmiş bir email var mı kontrol et
    const lastVerification =
      await EmailVerificationRepository.getLastVerificationRequest(user.id);

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

    // Yeni doğrulama emaili gönder
    await this.sendVerificationEmail(user);
  }
}
