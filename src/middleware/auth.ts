import { Forbidden } from "../domain/exception/forbidden";
import { Unauthorized } from "../domain/exception/unauthorized";
import { UserRole, Permissions } from "../domain/user";
import { Request, Response } from "express";

/* export function auth(roles?: UserRole[], userRoles?: Permissions[]) {
  return async (req: Request, res: Response, next: Function) => {
    if (!req.user || req.user.userId <= 0) {
      throw new Unauthorized("user is not found");
    }

    if (
      roles &&
      roles.length > 0 &&
      !roles.includes(req.user.role) &&
      req.user.role !== UserRole.Admin
    ) {
      throw new Forbidden(`user role should be one of ${roles.join(",")}`);
    }

    if (
      !isAuthorized(req.user.role, req.user.corporateRole, roles, userRoles)
    ) {
      throw new Forbidden(`invalid user/corporate role`);
    }

    next();
  };
}

const isAuthorized = (
  userRole: string,
  permission?: string,
  roles?: string[],
  permissions?: string[]
) => {
  if (userRole === UserRole.Admin) return true;
  if (!roles && !permissions) return true;

  const isUserRoleOk =
    !roles ||
    (roles && roles.length === 0) ||
    (roles && roles.length > 0 && roles.includes(userRole));

  const isPermissionsOk =
    !permissions ||
    (permissions && permissions.length === 0) ||
    (permissions &&
      permissions.length > 0 &&
      permissions.includes(permission || ""));

  if (!isUserRoleOk || !isPermissionsOk) {
    return false;
  }

  return true;
};
 */
