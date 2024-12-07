import { Forbidden } from "../domain/exception/forbidden";
import { Unauthorized } from "../domain/exception/unauthorized";
import { UserRole, Permissions } from "../domain/user";
import { Request, Response } from "express";

export function auth(roles?: UserRole[], userRoles?: Permissions[]) {
  return async (req: Request, res: Response, next: Function) => {
    if (!req.user || req.user.id! <= 0) {
      throw new Unauthorized("user is not found");
    }

    if (!isAuthorized(req.user.role, req.user.permissions, roles, userRoles)) {
      throw new Forbidden(`invalid user/corporate role`);
    }

    next();
  };
}

const isAuthorized = (
  userRole: UserRole,
  permission?: Permissions[],
  roles?: string[],
  permissions?: string[]
) => {
  if (userRole === UserRole.Admin) return true;
  if (!roles && !permissions) return false;

  const isUserRoleOk =
    !roles ||
    (roles && roles.length === 0) ||
    (roles && roles.length > 0 && roles.includes(userRole));

  const isPermissionsOk =
    !permissions ||
    (permissions && permissions.length === 0) ||
    (permissions &&
      permissions.length > 0 &&
      permissions.includes(permission?.toString() || ""));

  if (!isUserRoleOk || !isPermissionsOk) {
    return false;
  }
  return true;
};
