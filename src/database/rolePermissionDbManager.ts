import prisma from "../../prisma/client";
import { BusinessException, NotFound } from "../domain/exception";
import { GeneralRoleType } from "../types/rolePermissions/generalRoleType";
import { RolePermissionsType } from "../types/rolePermissions/rolePermissionsType";

export class RolePermissionDbManager {
  isPermissionUnique = async (
    name: string
  ): Promise<{ id: number; name: string; description: string } | null> => {
    const isPermissionFind = await prisma.permission.findUnique({
      where: { name: name },
    });
    return isPermissionFind;
  };
  addPermission = async (
    request: RolePermissionsType
  ): Promise<{ name: string; description: string; id: number }> => {
    const createdPermission = await prisma.permission.create({
      data: {
        name: request.permission.name,
        description: request.permission.description,
        recordStatus: "A",
        lastUpdateDate: new Date(),
        lastUpdatingUser: "BATCH",
        roles: {
          connect: request.roles.map((role) => ({ name: role.roleName })),
        },
      },
    });
    return createdPermission;
  };
  isPermissionConnectedRole = async (
    roleIds: number[],
    permissionId: number
  ): Promise<{ roleId: number; permissionId: number } | null> => {
    const existingRelation = await prisma.rolePermissions.findFirst({
      where: {
        permissionId: permissionId,
        roleId: { in: roleIds },
      },
    });
    return existingRelation;
  };
  updateRolePermission = async (
    permission: any,
    roleIdList: number[]
  ): Promise<{ name: string; id: number; description: string }> => {
    const currentRoles = await prisma.permission.findUnique({
      where: { id: permission?.permissionId },
      include: { roles: true },
    });

    const currentRoleIds = new Set(currentRoles!.roles.map((role) => role.id));
    const newRoleIds = new Set(roleIdList);

    const rolesToAdd = roleIdList.filter(
      (id: number) => !currentRoleIds.has(id)
    );

    const rolesToRemove = currentRoles!.roles.filter(
      (role) => !newRoleIds.has(role.id)
    );

    const updatedPermission = await prisma.permission.update({
      where: { id: permission?.permissionId },
      data: {
        description: permission?.description,
        name: permission?.name,
        roles: {
          disconnect: rolesToRemove.map((role) => ({ id: role.id })),
          connect: rolesToAdd.map((id: number) => ({ id })),
        },
      },
    });

    return updatedPermission;
  };

  getAllPermissionsWithRoles = async (page: number, pageSize: number) => {
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    const permissions = await prisma.permission.findMany({
      skip,
      take,
      include: {
        roles: true,
      },
    });

    return permissions;
  };

  getAllRoles = async () => {
    const roles = await prisma.role.findMany();
    return roles;
  };

  getPermissionsWithConnectedRole = async (role: string) => {
    const permissions = await prisma.role.findUnique({
      where: { name: role },
      include: {
        permissions: true,
      },
    });
    return permissions;
  };

  searchWithCriteria = async (
    role: string,
    permission: string,
    page: number,
    pageSize: number
  ) => {
    let searchResult;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    console.log(role, permission, page, pageSize);
    if (role && permission) {
      searchResult = await prisma.role.findMany({
        where: {
          name: role,
          permissions: {
            some: {
              name: permission,
            },
          },
        },
        include: {
          permissions: true,
        },
      });
    } else if (role && !permission) {
      searchResult = await prisma.role.findMany({
        where: {
          name: role,
        },
        include: {
          permissions: true,
        },
      });
    } else if (!role && permission) {
      searchResult = await prisma.permission.findMany({
        include: {
          roles: true,
        },
        where: {
          name: permission,
        },
      });
    } else {
      searchResult = await prisma.role.findMany({
        skip,
        take,
        include: {
          permissions: true,
        },
      });
    }
    return searchResult;
  };

  deletePermission = async (permissionId: number) => {
    const currentPermission = await prisma.permission.findUnique({
      where: { id: permissionId },
    });
    if (!currentPermission) {
      throw new NotFound("permission id not found");
    }

    const deletedPermission = await prisma.permission.update({
      where: { id: permissionId },
      data: {
        recordStatus: "P",
      },
    });

    return deletedPermission;
  };

  async updateUserRole(userId: number, newRoleId: number): Promise<any> {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          set: [{ id: newRoleId }],
        },
      },
    });
    return updatedUser;
  }
}
