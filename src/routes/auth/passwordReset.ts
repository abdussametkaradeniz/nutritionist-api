import express from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { PasswordResetDbManager } from "../../database/auth/passwordResetDbManager";
import { EmailService } from "../../services/emailService";
import { sendSuccess } from "../../helpers/responseHandler";
import { InvalidParameter, NotFound } from "../../domain/exception";
import prisma from "../../../prisma/client";

const router = express.Router();
const passwordResetDbManager = new PasswordResetDbManager();
const emailService = new EmailService();

// Şifre sıfırlama talebi
router.post("/request", async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFound("User not found");
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 saat geçerli

    await passwordResetDbManager.createResetToken({
      userId: user.id,
      token,
      expiresAt,
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await emailService.sendPasswordResetEmail(email, resetLink);

    sendSuccess(res, null, "Password reset email sent successfully");
  } catch (error) {
    next(error);
  }
});

// Şifre sıfırlama işlemi
router.post("/confirm", async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const resetToken = await passwordResetDbManager.getResetToken(token);
    if (!resetToken) {
      throw new InvalidParameter("Invalid or expired reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: hashedPassword },
    });

    await passwordResetDbManager.markTokenAsUsed(token);

    sendSuccess(res, null, "Password reset successfully");
  } catch (error) {
    next(error);
  }
});

export default router;
