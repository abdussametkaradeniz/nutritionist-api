import { Request, Response, NextFunction } from "express";
import { Role } from "../models/role.model";
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
export const hasPermission = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    const hasRequiredPermissions = permissions.every((permission) =>
      req.user?.permissions.includes(permission)
    );

    if (!hasRequiredPermissions) {
      return next(new AppError("Forbidden: Insufficient permissions", 403));
    }

    next();
  };
};
