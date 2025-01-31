import jwt from "jsonwebtoken";
import crypto from "crypto";
import { PrismaClient, User } from "@prisma/client";
import { BusinessException } from "../domain/exception";

const prisma = new PrismaClient();

export class TokenService {
  private static readonly ACCESS_TOKEN_SECRET =
    process.env.JWT_SECRET || "your-secret-key";
  private static readonly REFRESH_TOKEN_SECRET =
    process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret";

  // Access token oluşturma
  static generateAccessToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        dietitianId: user.dietitianId,
        roles: user.roles || [],
        permissions: user.permissions || [],
      },
      this.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" } // Access token 15 dakika geçerli
    );
  }

  // Refresh token oluşturma
  static async generateRefreshToken(user: User): Promise<string> {
    const token = crypto.randomBytes(40).toString("hex");

    await prisma.refreshToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
        lastUpdatingUser: user.username,
        lastUpdateDate: new Date(),
      },
    });

    return token;
  }

  // Refresh token doğrulama ve yeni access token oluşturma
  static async refreshAccessToken(refreshToken: string): Promise<string> {
    const tokenDoc = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        isRevoked: false,
        expiresAt: { gt: new Date() },
        recordStatus: "A",
      },
      include: {
        user: true,
      },
    });

    if (!tokenDoc) {
      throw new BusinessException("Invalid or expired refresh token", 401);
    }

    return this.generateAccessToken(tokenDoc.user);
  }

  // Refresh token'ı geçersiz kılma (logout için)
  static async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: {
        isRevoked: true,
        lastUpdateDate: new Date(),
        lastUpdatingUser: "SYSTEM",
      },
    });
  }

  // Kullanıcının tüm refresh token'larını geçersiz kılma
  static async revokeAllUserTokens(
    userId: number,
    username: string
  ): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        isRevoked: false,
        recordStatus: "A",
      },
      data: {
        isRevoked: true,
        lastUpdatingUser: username,
        lastUpdateDate: new Date(),
      },
    });
  }

  static async revokeAllUserRefreshTokens(userId: number): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: {
        isRevoked: true,
        lastUpdateDate: new Date(),
        lastUpdatingUser: "SYSTEM",
      },
    });
  }
}
