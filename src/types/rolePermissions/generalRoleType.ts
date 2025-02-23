import { Role } from "@prisma/client";

export type GeneralRoleType = {
  roleId: number;
  roleName: Role;
};
