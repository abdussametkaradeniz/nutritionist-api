import { Role, Permission, RolePermissions } from "../models/role.model";

export const rolePermissions: RolePermissions = {
  [Role.USER]: [
    Permission.READ_PROFILE,
    Permission.UPDATE_PROFILE,
    Permission.CREATE_APPOINTMENT,
  ],

  [Role.DIETITIAN]: [
    Permission.READ_PROFILE,
    Permission.UPDATE_PROFILE,
    Permission.UPDATE_APPOINTMENT,
    Permission.DELETE_APPOINTMENT,
  ],

  [Role.ADMIN]: Object.values(Permission),
};
