import { Forbidden } from "../domain/exception/forbidden";
import { Unauthorized } from "../domain/exception/unauthorized";
import { Request, Response } from "express";
import { UserRole } from "../types/user/UserRole";

// Define a custom interface for the user object
declare global {
  namespace Express {
    interface Request {
      user?: {
        roles: UserRole;
        permissions: string[];
      };
    }
  }
}

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
  userRoles: UserRole,
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
