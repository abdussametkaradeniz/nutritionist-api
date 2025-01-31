import prisma from "../../../prisma/client";
import { PasswordResetToken } from "../../types/auth/PasswordResetType";

export class PasswordResetDbManager {
  async createResetToken(data: PasswordResetToken): Promise<void> {
    await prisma.passwordReset.create({
      data: {
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
      },
    });
  }

  async getResetToken(token: string) {
    return await prisma.passwordReset.findFirst({
      where: {
        token: token,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
  }

  async markTokenAsUsed(token: string): Promise<void> {
    await prisma.passwordReset.update({
      where: {
        token: token,
      },
      data: {
        used: true,
      },
    });
  }
}
