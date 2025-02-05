import prisma from "../../prisma/client";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { EmailService } from "./emailService";
import { InvalidParameter, NotFound } from "../domain/exception";

export class PasswordResetService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFound("User not found");
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 saat geçerli

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.emailService.sendPasswordResetEmail(email, resetLink);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await prisma.passwordReset.findFirst({
      where: {
        token,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      throw new InvalidParameter("Invalid or expired reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: hashedPassword },
    });

    await prisma.passwordReset.update({
      where: { id: resetToken.id },
      data: { used: true },
    });
  }
}
