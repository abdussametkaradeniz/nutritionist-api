import { GeneralRoleType } from "./generalRoleType";

export type RolePermissionsType = {
  pageSize?: number;
  page?: number;
  permission: {
    permissionId?: number;
    name: string;
    description: string;
  };
  roles: GeneralRoleType[];
};
