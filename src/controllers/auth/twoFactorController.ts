import { Request, Response } from "express";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import prisma from "../../../prisma/client";
import { generateRandomCodes } from "../../utils/auth";

export const enable2FA = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `YourApp:${req.user?.email}`,
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Store secret temporarily (should be confirmed before saving permanently)
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret.base32,
        twoFactorEnabled: false,
      },
    });

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to setup 2FA" });
  }
};

export const verify2FA = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.twoFactorSecret) {
      return res.status(400).json({ error: "2FA not setup" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
    });

    if (!verified) {
      return res.status(400).json({ error: "Invalid token" });
    }

    // Generate backup codes if not already generated
    const backupCodes = generateRandomCodes(8);

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        backupCodes,
      },
    });

    res.json({
      enabled: true,
      backupCodes,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify 2FA" });
  }
};

export const disable2FA = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
        backupCodes: [],
      },
    });

    res.json({ message: "2FA disabled successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to disable 2FA" });
  }
};

export const verifyBackupCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.backupCodes.includes(code)) {
      return res.status(400).json({ error: "Invalid backup code" });
    }

    // Remove used backup code
    await prisma.user.update({
      where: { id: userId },
      data: {
        backupCodes: user.backupCodes.filter((c) => c !== code),
      },
    });

    res.json({ verified: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to verify backup code" });
  }
};

export const generateBackupCodes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const backupCodes = generateRandomCodes(8);

    await prisma.user.update({
      where: { id: userId },
      data: { backupCodes },
    });

    res.json({ backupCodes });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate backup codes" });
  }
};
