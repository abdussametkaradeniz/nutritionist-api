import { Forbidden } from "../domain/exception/forbidden";
import { Unauthorized } from "../domain/exception/unauthorized";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { UserRole } from "../types/user/UserRole";
import jwt, { JwtPayload } from "jsonwebtoken";
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

export const authenticateToken: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new BusinessException("Token gerekli", 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY!
    ) as JwtPayload & {
      userId: number;
      email: string;
      role: string;
      roles: UserRole[];
      permissions: string[];
    };

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
