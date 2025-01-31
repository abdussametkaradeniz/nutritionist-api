import { PrismaClient } from "@prisma/client";
import { BusinessException } from "../../domain/exception";

const prisma = new PrismaClient();

export class EmailVerificationDbManager {
  async createVerificationToken(data: {
    userId: number;
    token: string;
    expiresAt: Date;
  }) {
    return await prisma.emailVerification.create({
      data: {
        ...data,
        isUsed: false,
        recordStatus: "A",
        lastUpdateDate: new Date(),
        lastUpdatingUser: "SYSTEM",
      },
    });
  }

  async getVerificationToken(token: string) {
    const verification = await prisma.emailVerification.findFirst({
      where: {
        token,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
        recordStatus: "A",
      },
      include: {
        user: true,
      },
    });

    if (!verification) {
      throw new BusinessException(
        "Geçersiz veya süresi dolmuş doğrulama kodu",
        400
      );
    }

    return verification;
  }

  async markEmailAsVerified(userId: number) {
    await prisma.$transaction([
      // Email verification token'ı kullanıldı olarak işaretle
      prisma.emailVerification.updateMany({
        where: { userId },
        data: {
          isUsed: true,
          lastUpdateDate: new Date(),
          lastUpdatingUser: "SYSTEM",
        },
      }),
      // Kullanıcının email'ini doğrulanmış olarak işaretle
      prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified: true,
          lastUpdateDate: new Date(),
          lastUpdatingUser: "SYSTEM",
        },
      }),
    ]);
  }

  async getLastVerificationRequest(userId: number) {
    return await prisma.emailVerification.findFirst({
      where: {
        userId,
        recordStatus: "A",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
