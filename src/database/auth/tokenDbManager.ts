import prisma from "../../../prisma/client";
import { RefreshTokenPayload } from "../../types/auth/TokenType";

export class TokenDbManager {
  async saveRefreshToken(payload: RefreshTokenPayload): Promise<void> {
    await prisma.refreshToken.create({
      data: {
        userId: payload.userId,
        token: payload.token,
        expiresAt: payload.expiresAt,
        isRevoked: false,
      },
    });
  }

  async getRefreshToken(token: string): Promise<any> {
    return await prisma.refreshToken.findFirst({
      where: {
        token: token,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async revokeRefreshToken(tokenFamily: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: {
        token: tokenFamily,
      },
      data: {
        isRevoked: true,
      },
    });
  }
}
