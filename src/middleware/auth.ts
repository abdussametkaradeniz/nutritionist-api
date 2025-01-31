import { Forbidden } from "../domain/exception/forbidden";
import { Unauthorized } from "../domain/exception/unauthorized";
import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types/user/UserRole";
import jwt from "jsonwebtoken";
import { BusinessException } from "../domain/exception";

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

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new BusinessException("Token gerekli", 401);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    req.user = decoded as any;
    next();
  } catch (error) {
    throw new BusinessException("Geçersiz token", 401);
  }
};
