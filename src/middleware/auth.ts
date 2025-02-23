import { Forbidden } from "../domain/exception/forbidden";
import { Unauthorized } from "../domain/exception/unauthorized";
import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "../utils/appError";
import prisma from "../../prisma/client";
import { verifyToken } from "../helpers/jwt";
import { UserRole } from "src/constants/userRoles";
// Kaldır veya yorum satırına al
// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         roles: UserRole;
//         permissions: string[];
//       };
//     }
//   }
// }

export function auth(
  requiredRoles?: UserRole[],
  requiredPermissions?: string[]
) {
  return (req: Request, res: Response, next: Function) => {
    if (!req.user || req.user.roles.length === 0) {
      throw new Unauthorized("User is not found");
    }

    if (
      !isAuthorized(
        req.user.roles,
        requiredRoles,
        req.user.permissions,
        requiredPermissions
      )
    ) {
      throw new Forbidden(
        "Invalid user/corporate role or insufficient permissions"
      );
    }

    next();
  };
}

const isAuthorized = (
  userRoles: UserRole[],
  requiredRoles?: UserRole[],
  userPermissions: string[] = [],
  requiredPermissions?: string[]
) => {
  if (
    requiredRoles &&
    !requiredRoles.some((role) => userRoles.includes(role))
  ) {
    return false;
  }

  if (
    requiredPermissions &&
    !requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    )
  ) {
    return false;
  }

  return true;
};

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    if (!token) {
      throw new Unauthorized("No token provided");
    }

    const decoded = verifyToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError("Invalid token", 401));
    } else {
      next(error);
    }
  }
};
