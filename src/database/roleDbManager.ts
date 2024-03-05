import prisma from "../../prisma/client";

export class RoleDbManager {
  getAllRoles = async (): Promise<any> => {
    const roles = prisma.role.findMany();
    console.log(roles);
    return roles;
  };
}
