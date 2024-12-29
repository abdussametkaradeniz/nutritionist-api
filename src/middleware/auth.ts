import { Forbidden } from "../domain/exception/forbidden";
import { Unauthorized } from "../domain/exception/unauthorized";
import { Request, Response } from "express";
import { UserRole } from "../types/user/UserRole";

export function auth(roles?: UserRole[]) {
  return (req: Request, res: Response, next: Function) => {
    if (!req.user || req.user.roleId <= 0) {
      throw new Unauthorized("User is not found");
    }

    if (!isAuthorized(req.user.role, req.user.permissions, roles)) {
      throw new Forbidden("Invalid user/corporate role");
    }

    next();
  };
}

const isAuthorized = (
  userRole: UserRole,
  permissions: string[] = [],
  roles?: UserRole[]
) => {
  if (userRole === UserRole.ADMIN) return true;
  if (!roles) return false;

  const isUserRoleOk = roles.includes(userRole);

  // Eğer permissions kontrolü gerekiyorsa, burada ekleyebilirsiniz
  // const isPermissionsOk = permissions.includes(...);

  return isUserRoleOk; // && isPermissionsOk; // Eğer permissions kontrolü eklenirse
};
