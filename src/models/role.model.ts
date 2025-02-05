export enum Role {
  USER = "USER",
  DIETITIAN = "DIETITIAN",
  ADMIN = "ADMIN",
}

export enum Permission {
  READ_PROFILE = "read:profile",
  UPDATE_PROFILE = "update:profile",
  DELETE_PROFILE = "delete:profile",

  CREATE_APPOINTMENT = "create:appointment",
  UPDATE_APPOINTMENT = "update:appointment",
  DELETE_APPOINTMENT = "delete:appointment",

  MANAGE_USERS = "manage:users",
  MANAGE_DIETITIANS = "manage:dietitians",
  MANAGE_SYSTEM = "manage:system",
}

export interface RolePermissions {
  [Role.USER]: Permission[];
  [Role.DIETITIAN]: Permission[];
  [Role.ADMIN]: Permission[];
}
