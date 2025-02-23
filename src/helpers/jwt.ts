import jwt, { Secret } from "jsonwebtoken";
import { TokenType, RefreshTokenPayload } from "../types/auth/TokenType";
import { UserType } from "../types/user/User";
import prisma from "../../prisma/client";
import { uuid } from "uuidv4";
import { UserRole } from "src/constants/userRoles";

const ACCESS_TOKEN_EXPIRES_IN = 1 * 60 * 60;
const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60;

export async function generateTokens(user: UserType): Promise<TokenType> {
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id!);
  const expDate = new Date(Date.now() + ACCESS_TOKEN_EXPIRES_IN);

  return {
    accessToken,
    refreshToken,
    expiresIn: expDate,
  };
}

export function generateAccessToken(user: UserType): string {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET_KEY as Secret, {
    expiresIn: "2 days",
  });
}

export async function generateRefreshToken(userId: number): Promise<string> {
  const tokenFamily = uuid();

  const expirationDate = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN);

  // Save refresh token to database
  await prisma.refreshToken.create({
    data: {
      userId,
      token: tokenFamily,
      expiresAt: expirationDate,
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
        role: true,
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
    const userWithCorrectRole: UserType = {
      ...user,
      role: user.role.name as UserRole,
    };
    // Generate new tokens
    return await generateTokens(userWithCorrectRole);
  } catch (error) {
    return null;
  }
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY as Secret) as {
      userId: number;
      username: string;
      email: string;
      role: string;
      permissions: string[];
    };
  } catch (error) {
    throw new Error("Invalid token");
  }
}
