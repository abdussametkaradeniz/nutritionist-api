import jwt, { Secret } from "jsonwebtoken";
import { TokenType, RefreshTokenPayload } from "../types/auth/TokenType";
import { UserType } from "../types/user/User";
import { TokenDbManager } from "../database/auth/tokenDbManager";
import prisma from "../../prisma/client";
import { uuid } from "uuidv4";

const tokenDbManager = new TokenDbManager();
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export async function generateTokens(user: UserType): Promise<TokenType> {
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id!);

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
  };
}

function generateAccessToken(user: UserType): string {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    roles: user.userRoles?.map((role) => role.name) || [],
    permissions: user.permissions || [],
  };

  return jwt.sign(payload, process.env.JWT_SECRET_KEY as Secret, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

async function generateRefreshToken(userId: number): Promise<string> {
  const tokenFamily = uuid();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  const payload: RefreshTokenPayload = {
    userId,
    token: tokenFamily,
    expiresAt,
  };

  await tokenDbManager.saveRefreshToken(payload);

  return jwt.sign({ tokenFamily }, process.env.JWT_REFRESH_SECRET as Secret, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<TokenType | null> {
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET as Secret
    ) as any;
    const tokenData = await tokenDbManager.getRefreshToken(decoded.tokenFamily);

    if (!tokenData) {
      return null;
    }

    // Get user data with proper include
    const user = await prisma.user.findUnique({
      where: {
        id: tokenData.userId,
      },
      include: {
        userRoles: true,
      },
    });

    if (!user) {
      return null;
    }

    // Convert Prisma User to UserType
    const userType: UserType = {
      id: user.id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      passwordHash: user.passwordHash,
      userRoles: user.userRoles,
      dietitianId: user.dietitianId,
      lastUpdatingUser: user.lastUpdatingUser,
      lastUpdateDate: user.lastUpdateDate,
      recordStatus: user.recordStatus,
    };

    // Revoke old refresh token
    await tokenDbManager.revokeRefreshToken(decoded.tokenFamily);

    // Generate new tokens
    return await generateTokens(userType);
  } catch (error) {
    return null;
  }
}
