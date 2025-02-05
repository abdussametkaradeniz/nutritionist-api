import jwt, { Secret } from "jsonwebtoken";
import { TokenType, RefreshTokenPayload } from "../types/auth/TokenType";
import { UserType } from "../types/user/User";
import prisma from "../../prisma/client";
import { uuid } from "uuidv4";

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

  // Save refresh token to database
  await prisma.refreshToken.create({
    data: {
      userId,
      token: tokenFamily,
      expiresAt,
    },
  });

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

    // Find refresh token in database
    const tokenData = await prisma.refreshToken.findFirst({
      where: {
        token: decoded.tokenFamily,
        isRevoked: false,
      },
    });

    if (!tokenData) {
      return null;
    }

    // Get user data
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

    // Revoke old refresh token
    await prisma.refreshToken.update({
      where: {
        id: tokenData.id,
      },
      data: {
        isRevoked: true,
      },
    });

    // Generate new tokens
    return await generateTokens(user);
  } catch (error) {
    return null;
  }
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY as Secret) as {
      id: number;
      username: string;
      email: string;
      roles: string[];
      permissions: string[];
    };
  } catch (error) {
    throw new Error("Invalid token");
  }
}
