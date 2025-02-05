import { Request, Response, NextFunction } from "express";
import { Role, Permission } from "../models/role.model";
import { rolePermissions } from "../config/permissions";
import { AppError } from "../utils/appError";

// Rol kontrolü için middleware
export const hasRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    if (!roles.includes(req.user.role as Role)) {
      return next(new AppError("Forbidden: Insufficient role", 403));
    }

    next();
  };
};

// İzin kontrolü için middleware
export const hasPermission = (permissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    const userRole = req.user.role as Role;
    const userPermissions = rolePermissions[userRole];

    const hasRequiredPermissions = permissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasRequiredPermissions) {
      return next(new AppError("Forbidden: Insufficient permissions", 403));
    }

    next();
  };
};
