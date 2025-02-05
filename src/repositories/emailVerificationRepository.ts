import { PrismaClient } from "@prisma/client";

export class EmailVerificationRepository {
  private static prisma = new PrismaClient();

  static async createVerificationToken(data: {
    userId: number;
    token: string;
    expiresAt: Date;
  }) {
    return await this.prisma.emailVerification.create({
      data: {
        ...data,
        lastUpdatingUser: data.userId.toString(),
      },
    });
  }

  static async getVerificationToken(token: string) {
    return await this.prisma.emailVerification.findFirst({
      where: { token },
      include: { user: true },
    });
  }

  static async getLastVerificationRequest(userId: number) {
    return await this.prisma.emailVerification.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async markEmailAsVerified(userId: number) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }
}
